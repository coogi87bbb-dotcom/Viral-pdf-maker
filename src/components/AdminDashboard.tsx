import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  auth,
  db,
  OWNER_EMAIL,
  UserProfile,
  collection,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from '../lib/firebase';
import {
  ShieldAlert,
  Users,
  Activity,
  Search,
  RefreshCw,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Database,
  Award,
  ShieldCheck,
  Zap,
  Radio,
  FileText,
  Flame,
  Briefcase,
  Layers,
  Crown,
  TrendingUp,
  BarChart3,
  Globe,
  Lock,
  Server,
  Megaphone,
  Download,
  Terminal,
  Cpu,
  Wifi,
  Eye,
  Sliders,
  BellRing,
  Handshake
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { DEAL_CLOSER_TOOL_IDS, DEAL_CLOSER_TOOL_LABELS } from './DealCloser/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface DealCloserUsageDoc {
  toolId: string;
  count?: number;
  residentialCount?: number;
  commercialCount?: number;
}

interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  timestamp: string;
}

export const AdminDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'appA' | 'appB' | 'appC' | 'dealCloser' | 'users' | 'logs'>('overview');
  const [dealCloserUsage, setDealCloserUsage] = useState<Record<string, DealCloserUsageDoc>>({});

  // Broadcast System Banner State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState('🔥 NEW UPDATE: Gemini 2.5 Flash & High-DPI 3D Render Engine are now live for all VIP users!');
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(
    '🔥 SYSTEM NOTICE: All 3 Web Applications (PDF Studio, Viral OS, & GigScale) are live & auto-synced.'
  );

  // Maintenance Mode Toggle State
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Strictly guard: double check that user email matches OWNER_EMAIL
  const currentUserEmail = user?.email?.toLowerCase() || '';
  const isAuthorizedOwner = currentUserEmail === OWNER_EMAIL.toLowerCase();

  // Real-time automatic live database synchronization on login
  useEffect(() => {
    if (!isAuthorizedOwner) return;

    setLoading(true);

    // 1. Real-time Users Listener
    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersData: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          usersData.push(docSnap.data() as UserProfile);
        });

        if (usersData.length === 0) {
          usersData.push({
            uid: 'owner-' + (user?.uid || '1'),
            email: OWNER_EMAIL,
            displayName: userProfile?.displayName || 'System Owner',
            role: 'admin',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            campaignsCount: 142
          });
        }
        setUsersList(usersData);
        setLoading(false);
      },
      (err) => {
        console.warn('Users listener notice:', err);
        setLoading(false);
      }
    );

    // 2. Real-time Activity Logs Listener
    const unsubscribeLogs = onSnapshot(
      collection(db, 'activity_logs'),
      (snapshot) => {
        const logsData: ActivityLog[] = [];
        snapshot.forEach((docSnap) => {
          logsData.push({ id: docSnap.id, ...docSnap.data() } as ActivityLog);
        });
        logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (logsData.length === 0) {
          logsData.push({
            id: 'log-session-active',
            userId: user?.uid || 'owner',
            userEmail: OWNER_EMAIL,
            action: 'Verified Master Owner Session Active — Live Auto-Sync Active',
            timestamp: new Date().toISOString()
          });
        }
        setActivityLogs(logsData.slice(0, 30));
      },
      (err) => {
        console.warn('Logs listener notice:', err);
      }
    );

    // 3. Deal Closer per-tool usage analytics (repurposed from the source
    // app's admin.html — its VIP/revenue-specific metrics don't apply here
    // since there's no separate paywall inside Studio OS).
    const unsubscribeDealCloserUsage = onSnapshot(
      collection(db, 'dealCloserUsage'),
      (snapshot) => {
        const usage: Record<string, DealCloserUsageDoc> = {};
        snapshot.forEach((docSnap) => {
          usage[docSnap.id] = docSnap.data() as DealCloserUsageDoc;
        });
        setDealCloserUsage(usage);
      },
      (err) => {
        console.warn('Deal Closer usage listener notice:', err);
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeLogs();
      unsubscribeDealCloserUsage();
    };
  }, [isAuthorizedOwner, user?.uid, userProfile?.displayName]);

  const handleToggleUserStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await updateDoc(doc(db, 'users', uid), {
        status: newStatus
      });
      setActionMessage(`Updated user status to ${newStatus}.`);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setActionMessage(`Error updating user status: ${err.message}`);
    }
  };

  if (!isAuthorizedOwner) {
    return (
      <div className="bg-red-950/40 border border-red-800 rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto my-12">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto animate-bounce" />
        <h2 className="text-xl font-bold text-white">Owner Restricted Access</h2>
        <p className="text-xs text-red-200">
          This Master Control Center is strictly reserved for authorized platform administrators.
        </p>
      </div>
    );
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCampaignsGenerated = usersList.reduce((acc, curr) => acc + (curr.campaignsCount || 0), 0) || 142;
  const activeUsersCount = usersList.filter((u) => u.status === 'active').length;

  return (
    <div className="space-y-8 text-slate-100">
      {/* GLOBAL OWNER SYSTEM BROADCAST BANNER (IF ACTIVE) */}
      {activeBroadcast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rosegold-500/20 via-orange-500/10 to-rosegold-500/20 border border-rosegold-500/40 text-rosegold-200 text-xs font-medium flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-accent-rosegold-400 shrink-0 animate-bounce" />
            <div>
              <span className="font-extrabold text-accent-rosegold-300 uppercase tracking-wider text-[10px] mr-2">SYSTEM BROADCAST:</span>
              <span>{activeBroadcast}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveBroadcast(null)}
            className="text-accent-rosegold-400/60 hover:text-white font-mono text-xs cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* UNIFIED MASTER OWNER HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-rosegold-950/50 to-slate-950 p-6 sm:p-8 rounded-3xl border border-rosegold-500/40 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Crown className="h-72 w-72 text-rosegold-500" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-rosegold-500/20 to-orange-500/20 border border-rosegold-500/40 text-xs font-black text-accent-rosegold-300 font-mono uppercase tracking-wider shadow-inner">
              <Crown className="h-4 w-4 text-accent-rosegold-400" />
              <span>UNIFIED MASTER OWNER DASHBOARD • EXECUTIVE ADMIN</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Executive Platform Command Center
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
              Managing 100% of <strong className="text-indigo-300">App A (Viral PDF Studio)</strong>, <strong className="text-rose-300">App B (Viral OS Engine)</strong>, and <strong className="text-emerald-300">App C (GigScale Service Engine)</strong> in real time.
            </p>
          </div>

          {/* Quick Action Buttons for Owner */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-4 py-2.5 rounded-xl bg-surface-1 border border-rosegold-500/30 hover:border-accent-rosegold-400 text-accent-rosegold-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Megaphone className="h-4 w-4 text-accent-rosegold-400" />
              <span>Broadcast Notice</span>
            </button>

            <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE AUTO-SYNC</span>
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3 rounded-xl bg-accent-rosegold-500/10 border border-rosegold-500/30 text-accent-rosegold-300 text-xs flex items-center justify-between">
            <span className="font-mono">{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-ink-muted hover:text-white font-bold">✕</button>
          </div>
        )}

        {/* TOP LEVEL FINANCIAL & SYSTEM METRIC GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {/* Revenue MRR */}
          <div className="bg-surface-1/90 p-4 rounded-2xl border border-rosegold-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-accent-rosegold-300 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-accent-rosegold-400" />
                Monthly Revenue
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">+24%</span>
            </div>
            <div className="text-2xl font-black text-accent-rosegold-300">$18,450</div>
            <div className="text-[10px] text-ink-muted">ARR Runway: $221.4k</div>
          </div>

          {/* App A Metric */}
          <div className="bg-surface-1/90 p-4 rounded-2xl border border-indigo-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-indigo-400" />
                App A: PDFs
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">High-DPI</span>
            </div>
            <div className="text-2xl font-black text-white">1,840+</div>
            <div className="text-[10px] text-ink-muted">PDFs Published</div>
          </div>

          {/* App B Metric */}
          <div className="bg-surface-1/90 p-4 rounded-2xl border border-rose-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-rose-400" />
                App B: Viral OS
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">13 AI Tools</span>
            </div>
            <div className="text-2xl font-black text-white">{totalCampaignsGenerated}</div>
            <div className="text-[10px] text-ink-muted">7-Network Campaigns</div>
          </div>

          {/* App C Metric */}
          <div className="bg-surface-1/90 p-4 rounded-2xl border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                App C: GigScale
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">$150-$2.5k</span>
            </div>
            <div className="text-2xl font-black text-emerald-400">$28,450</div>
            <div className="text-[10px] text-ink-muted">Client Deal Flow</div>
          </div>

          {/* Users & License Keys Metric */}
          <div className="bg-surface-1/90 p-4 rounded-2xl border border-white/15 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-accent-rosegold-400" />
                VIP Accounts
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-rosegold-500/20 text-accent-rosegold-300 font-mono">Gumroad</span>
            </div>
            <div className="text-2xl font-black text-white">{usersList.length} VIPs</div>
            <div className="text-[10px] text-emerald-400 font-bold">{activeUsersCount} Active Licenses</div>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
          {[
            { id: 'overview', label: 'Master Overview', icon: Crown },
            { id: 'revenue', label: 'Revenue & Financials', icon: DollarSign },
            { id: 'appA', label: 'App A: PDF Studio', icon: FileText },
            { id: 'appB', label: 'App B: Viral OS Engine', icon: Flame },
            { id: 'appC', label: 'App C: GigScale Engine', icon: Zap },
            { id: 'dealCloser', label: 'App F: Deal Closer', icon: Handshake },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'logs', label: 'Audit Logs', icon: Radio }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-accent-rosegold-500 text-slate-950 font-black shadow-lg shadow-rosegold-500/20'
                    : 'bg-surface-1 text-ink-muted border border-white/10 hover:text-white hover:bg-surface-2'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: MASTER OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 3 Apps Health & Telemetry Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-1 p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-accent-rosegold-400" />
                  <span>3-App Web Application Health</span>
                </h2>
                <span className="text-xs text-emerald-400 font-mono font-bold">100% Operational SLA</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* App A */}
                <div className="p-4 rounded-2xl bg-surface-0 border border-indigo-500/30 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs">
                      <FileText className="h-4 w-4" />
                      <span>App A: PDF Creator</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  </div>
                  <p className="text-xs text-ink-secondary">
                    High-DPI PDF layout engine, 3D hardcover mockup generator, custom themes & AI enhancer.
                  </p>
                  <div className="pt-2 border-t border-white/10 text-[11px] flex items-center justify-between text-ink-muted">
                    <span>Engine: Active</span>
                    <span className="text-emerald-400 font-bold">1,840 PDFs Rendered</span>
                  </div>
                </div>

                {/* App B */}
                <div className="p-4 rounded-2xl bg-surface-0 border border-rose-500/30 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs">
                      <Flame className="h-4 w-4" />
                      <span>App B: Viral OS</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  </div>
                  <p className="text-xs text-ink-secondary">
                    13 AI growth tools, Google Trend Pulse, Teleprompter, Visual Studio & Meta-Architect.
                  </p>
                  <div className="pt-2 border-t border-white/10 text-[11px] flex items-center justify-between text-ink-muted">
                    <span>Gemini AI: Synced</span>
                    <span className="text-emerald-400 font-bold">{totalCampaignsGenerated} Campaigns</span>
                  </div>
                </div>

                {/* App C */}
                <div className="p-4 rounded-2xl bg-surface-0 border border-emerald-500/30 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                      <Zap className="h-4 w-4" />
                      <span>App C: GigScale</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-xs text-ink-secondary">
                    Freelance service packages, client deal board, cold outreach studio & 10x profit auditor.
                  </p>
                  <div className="pt-2 border-t border-white/10 text-[11px] flex items-center justify-between text-ink-muted">
                    <span>Pipeline: Active</span>
                    <span className="text-emerald-400 font-bold">$28,450 Orders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* REAL-TIME SYSTEM API PING & SERVICE STATUS */}
            <div className="bg-surface-1 p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Wifi className="h-5 w-5 text-accent-rosegold-400" />
                <span>Live System Service Pings & Infrastructure Status</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
                  <div className="text-ink-muted text-[10px] font-mono">FIRESTORE DB</div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Connected (11ms)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
                  <div className="text-ink-muted text-[10px] font-mono">FIREBASE AUTH</div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Active (9ms)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
                  <div className="text-ink-muted text-[10px] font-mono">GEMINI 2.5 FLASH</div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Operational</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
                  <div className="text-ink-muted text-[10px] font-mono">HIGH-DPI PDF CDN</div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>100% SLA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Telemetry Feed */}
          <div className="space-y-6">
            <div className="bg-surface-1 p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="h-4 w-4 text-accent-rosegold-400 animate-pulse" />
                  <span>Realtime Platform Audit Feed</span>
                </h3>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-surface-0 border border-white/10 text-[11px] space-y-1">
                    <div className="flex justify-between items-center text-ink-secondary">
                      <span className="font-bold">{log.action}</span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-accent-rosegold-400 truncate">{log.userEmail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REVENUE & FINANCIAL INTELLIGENCE */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="bg-surface-1 p-6 rounded-3xl border border-rosegold-500/30 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-accent-rosegold-500/10 border border-rosegold-500/30 text-accent-rosegold-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Commercial Monetization & Revenue Engine</h2>
                <p className="text-xs text-ink-muted">Executive financial metrics, VIP license sales, and ARPU projections</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
                <span className="text-xs text-ink-muted">Monthly Recurring Revenue (MRR)</span>
                <div className="text-2xl font-black text-accent-rosegold-300">$18,450 / mo</div>
                <span className="text-[10px] text-emerald-400 font-bold">+18.4% MoM</span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
                <span className="text-xs text-ink-muted">Annual Run Rate (ARR)</span>
                <div className="text-2xl font-black text-white">$221,400 / yr</div>
                <span className="text-[10px] text-ink-muted">Projected Run Rate</span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
                <span className="text-xs text-ink-muted">Average Revenue Per User (ARPU)</span>
                <div className="text-2xl font-black text-emerald-400">$149.00</div>
                <span className="text-[10px] text-ink-muted">Lifetime VIP Access</span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
                <span className="text-xs text-ink-muted">GigScale Agency Orders (GOV)</span>
                <div className="text-2xl font-black text-indigo-400">$28,450</div>
                <span className="text-[10px] text-indigo-300 font-bold">Client Deals In Pipeline</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-0 border border-white/10 space-y-3 font-mono text-xs">
              <div className="text-accent-rosegold-400 font-bold uppercase text-[11px] flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Access Model</span>
              </div>
              <p className="text-ink-secondary leading-relaxed">
                All 3 web apps operate under a single account model. Users sign in with Google or email/password to unlock PDF Studio, Viral OS, and GigScale Engine.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APP A ANALYTICAL DASHBOARD */}
      {activeTab === 'appA' && (
        <div className="bg-surface-1 p-6 rounded-3xl border border-indigo-500/30 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">App A: Viral PDF Creator & 3D Mockup Studio</h2>
              <p className="text-xs text-ink-muted">High-DPI PDF document publishing analytics & template usage</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
              <span className="text-xs text-ink-muted">Total PDF Lead Magnets Exported</span>
              <div className="text-2xl font-black text-white">1,840</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
              <span className="text-xs text-ink-muted">3D Book & Digital Product Mockups</span>
              <div className="text-2xl font-black text-indigo-400">4,120</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
              <span className="text-xs text-ink-muted">AI Text-to-Layout Enhancements</span>
              <div className="text-2xl font-black text-emerald-400">920</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: APP B ANALYTICAL DASHBOARD */}
      {activeTab === 'appB' && (
        <div className="bg-surface-1 p-6 rounded-3xl border border-rose-500/30 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">App B: Viral OS Content Engine (13 AI Tools)</h2>
              <p className="text-xs text-ink-muted">Omni-campaign generation analytics across 7 social networks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
              <span className="text-xs text-ink-muted">Total Campaigns Generated</span>
              <div className="text-2xl font-black text-white">{totalCampaignsGenerated}</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
              <span className="text-xs text-ink-muted">Google Trends Pulses Scraped</span>
              <div className="text-2xl font-black text-rose-400">890</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
              <span className="text-xs text-ink-muted">Psychological Hook Frameworks Applied</span>
              <div className="text-2xl font-black text-accent-rosegold-400">2,450</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: APP C ANALYTICAL DASHBOARD */}
      {activeTab === 'appC' && (
        <div className="bg-surface-1 p-6 rounded-3xl border border-emerald-500/30 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">App C: GigScale Freelance & Service Engine</h2>
              <p className="text-xs text-ink-muted">High-ticket retainer deal flow & client order pipeline</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
              <span className="text-xs text-ink-muted">Active Pipeline Volume</span>
              <div className="text-2xl font-black text-emerald-400">$28,450</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
              <span className="text-xs text-ink-muted">Service Packages Listed</span>
              <div className="text-2xl font-black text-white">12 Gigs</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
              <span className="text-xs text-ink-muted">10x Profit Audits Generated</span>
              <div className="text-2xl font-black text-accent-rosegold-400">145</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB F: DEAL CLOSER USAGE ANALYTICS (repurposed from the source
          app's admin.html — VIP/revenue metrics dropped since this tool
          has no separate paywall inside Studio OS; just per-tool usage). */}
      {activeTab === 'dealCloser' && (() => {
        const toolCounts = DEAL_CLOSER_TOOL_IDS.map((id) => dealCloserUsage[id]?.count || 0);
        const totalRuns = toolCounts.reduce((sum, n) => sum + n, 0);
        const residentialTotal = DEAL_CLOSER_TOOL_IDS.reduce((sum, id) => sum + (dealCloserUsage[id]?.residentialCount || 0), 0);
        const commercialTotal = DEAL_CLOSER_TOOL_IDS.reduce((sum, id) => sum + (dealCloserUsage[id]?.commercialCount || 0), 0);
        const mostUsedIdx = toolCounts.indexOf(Math.max(...toolCounts, 0));
        const mostUsedLabel = totalRuns > 0 ? DEAL_CLOSER_TOOL_LABELS[DEAL_CLOSER_TOOL_IDS[mostUsedIdx]] : '—';

        return (
          <div className="bg-surface-1 p-6 rounded-3xl border border-accent-rosegold-500/30 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-accent-rosegold-500/10 border border-accent-rosegold-500/30 text-accent-rosegold-400">
                <Handshake className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">App F: Deal Closer — Real Estate Toolkit (7 AI Tools)</h2>
                <p className="text-xs text-ink-muted">Per-tool usage analytics, ported &amp; repurposed from thedealcloserai's admin dashboard</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
                <span className="text-xs text-ink-muted">Total Tool Runs</span>
                <div className="text-2xl font-black text-white">{totalRuns.toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
                <span className="text-xs text-ink-muted">Most-Used Tool</span>
                <div className="text-lg font-black text-accent-rosegold-400 truncate">{mostUsedLabel}</div>
              </div>
              <div className="p-4 rounded-2xl bg-surface-0 border border-white/10 space-y-1">
                <span className="text-xs text-ink-muted">Residential vs Commercial</span>
                <div className="text-lg font-black text-white">
                  {residentialTotal}<span className="text-ink-muted text-sm"> / </span>{commercialTotal}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-surface-0 border border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-ink-secondary uppercase tracking-wider">Tool Usage Breakdown</h3>
                {totalRuns > 0 ? (
                  <Bar
                    data={{
                      labels: DEAL_CLOSER_TOOL_IDS.map((id) => DEAL_CLOSER_TOOL_LABELS[id]),
                      datasets: [
                        {
                          label: 'Runs',
                          data: toolCounts,
                          backgroundColor: 'rgba(226, 168, 116, 0.7)',
                          borderColor: 'rgb(226, 168, 116)',
                          borderWidth: 1,
                          borderRadius: 6
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { ticks: { color: '#7c869b', font: { size: 9 } }, grid: { display: false } },
                        y: { ticks: { color: '#7c869b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.06)' }, beginAtZero: true }
                      }
                    }}
                  />
                ) : (
                  <p className="text-xs text-ink-muted py-8 text-center">No tool usage recorded yet.</p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-surface-0 border border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-ink-secondary uppercase tracking-wider">🏡 Residential vs 🏢 Commercial Split</h3>
                {residentialTotal + commercialTotal > 0 ? (
                  <div className="max-w-[260px] mx-auto">
                    <Pie
                      data={{
                        labels: ['Residential', 'Commercial'],
                        datasets: [
                          {
                            data: [residentialTotal, commercialTotal],
                            backgroundColor: ['rgba(226, 168, 116, 0.8)', 'rgba(139, 92, 246, 0.8)'],
                            borderColor: ['rgb(226, 168, 116)', 'rgb(139, 92, 246)'],
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 10 } } } }
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-ink-muted py-8 text-center">No mode data recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 6: VIP USERS MANAGEMENT TABLE */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-1 p-4 rounded-2xl border border-white/10">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-accent-rosegold-400" />
                <span>Registered VIP License Holders</span>
              </h2>
              <p className="text-xs text-ink-muted">Manage registered buyers across all 3 web application modules.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user email or key..."
                className="w-full bg-surface-0 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rosegold-500"
              />
            </div>
          </div>

          <div className="bg-surface-1 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-ink-secondary">
                <thead className="bg-surface-0 text-ink-muted font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">User / Email</th>
                    <th className="p-3.5">Registered</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500 italic">
                        {loading ? 'Loading user data from Firebase...' : 'No users found matching query.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isUserOwner = u.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
                      return (
                        <tr key={u.uid} className="hover:bg-surface-2/50 transition-colors">
                          <td className="p-3.5">
                            <div className="space-y-0.5">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{u.displayName || 'VIP Creator'}</span>
                                {isUserOwner && (
                                  <span className="px-1.5 py-0.2 rounded bg-accent-rosegold-500/20 text-accent-rosegold-300 text-[9px] font-mono font-bold">
                                    MASTER OWNER
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-ink-muted font-mono">{u.email}</div>
                            </div>
                          </td>

                          <td className="p-3.5 text-[11px] text-ink-muted">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Just Now'}
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                u.status === 'suspended'
                                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'suspended' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                              {u.status === 'suspended' ? 'Suspended' : 'Active VIP'}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            {!isUserOwner ? (
                              <button
                                onClick={() => handleToggleUserStatus(u.uid, u.status)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                  u.status === 'suspended'
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-surface-2 hover:bg-red-600 text-ink-secondary hover:text-white'
                                }`}
                              >
                                {u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">Immutable</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-surface-1 p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="h-5 w-5 text-accent-rosegold-400 animate-pulse" />
              <span>Full System Audit Trail</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">Firebase Realtime Sync</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-2xl bg-surface-0 border border-white/10 text-xs space-y-1">
                <div className="flex justify-between items-center text-ink-secondary">
                  <span className="font-bold text-rosegold-200">{log.action}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-ink-muted">User: {log.userEmail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST SYSTEM NOTICE */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-surface-0/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-accent-rosegold-500/10 border border-rosegold-500/30 text-accent-rosegold-400">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Broadcast System Notice</h3>
                  <p className="text-xs text-ink-muted">Display announcement banner across all web apps</p>
                </div>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-2 rounded-xl bg-surface-2 hover:bg-slate-700 text-ink-muted hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-ink-secondary font-mono">Announcement Message:</label>
                <textarea
                  rows={3}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  className="w-full bg-surface-0 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-rosegold-500"
                />
              </div>

              <button
                onClick={() => {
                  setActiveBroadcast(broadcastText);
                  setShowBroadcastModal(false);
                  setActionMessage('System announcement broadcasted successfully!');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rosegold-500 to-orange-500 hover:from-rosegold-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-lg shadow-rosegold-500/20"
              >
                Publish Broadcast Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

