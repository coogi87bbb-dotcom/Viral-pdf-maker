import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { OWNER_EMAIL } from '../lib/firebase';
import { ModalShell } from './ui/ModalShell';
import { Button } from './ui/Button';
import {
  Lock,
  Mail,
  User,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Award,
  Zap
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const cleanEmailInput = email.trim().toLowerCase();
  const isOwnerEmail = cleanEmailInput === OWNER_EMAIL.toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isOwnerEmail) {
        // Owner signs in directly; if the account doesn't exist yet, create it.
        try {
          await login(email, password);
        } catch (loginErr) {
          await signUp(email, password, displayName || 'System Owner');
        }
      } else if (isSignUp) {
        if (!email || !password || !displayName) {
          throw new Error('Please fill out all fields.');
        }
        await signUp(email, password, displayName);
      } else {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        await login(email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please check your credentials or click Sign Up.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters long.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell maxWidthClassName="max-w-md" className="relative">
      {/* Glow Effects */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-violet-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-surface-2 via-surface-2 to-surface-1 border-b border-white/10 text-center space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-violet-500/10 border border-accent-violet-500/20 text-xs font-semibold text-accent-violet-400">
          <ShieldCheck className="h-4 w-4 text-accent-violet-400" />
          <span>Official Creator Workspace</span>
        </div>

        <div className="flex items-center justify-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-accent-amber-500 via-accent-violet-500 to-accent-amber-400 p-0.5 shadow-[var(--shadow-glow-amber)] flex items-center justify-center">
            <div className="h-full w-full bg-surface-0 rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-accent-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-ink-primary tracking-[-0.03em] font-display">Viral PDF Creator</h1>
        </div>

        <p className="text-xs text-ink-muted max-w-xs mx-auto leading-[1.7]">
          {isSignUp
            ? 'Create your account to access high-DPI document publishing, 3D mockups, and viral campaign tools.'
            : 'Sign in to access your PDF publishing studio and viral marketing workspace.'}
        </p>
      </div>

      {/* Form Body */}
      <div className="p-6 sm:p-8 space-y-5 relative z-10">
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-red-200">Access Error</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Google Sign-In Direct Button */}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          loading={googleLoading}
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="!bg-white hover:!bg-slate-100 !text-slate-900 !border-slate-200 !shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
        >
          {!googleLoading && (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-surface-2 px-3 text-[10px] font-bold text-ink-muted uppercase tracking-widest shrink-0 relative z-10">
            Or sign in with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
                Full Name / Agency Title
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera or Apex Media"
                  className="w-full bg-surface-0 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink-primary placeholder-slate-600 transition-[border-color,box-shadow] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber-400 focus:border-accent-amber-500"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-surface-0 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink-primary placeholder-slate-600 transition-[border-color,box-shadow] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber-400 focus:border-accent-amber-500"
                required
              />
            </div>
            {isOwnerEmail && (
              <div className="p-2 rounded-xl bg-accent-amber-500/10 border border-accent-amber-500/30 text-[11px] text-accent-amber-300 flex items-center gap-1.5 font-medium">
                <Award className="h-3.5 w-3.5 text-accent-amber-400 shrink-0" />
                <span>System Administrator Detected: Direct Access Enabled</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-surface-0 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink-primary placeholder-slate-600 transition-[border-color,box-shadow] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber-400 focus:border-accent-amber-500"
                required
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="mt-2">
            {!loading && (
              <>
                <Zap className="h-4 w-4 text-slate-950" />
                <span>{isSignUp ? 'Create Creator Account' : 'Sign In to Viral PDF Creator'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Mode Switcher */}
        <div className="pt-2 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-xs text-ink-muted hover:text-ink-primary transition-[color] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber-400 rounded"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Need a new account? Create Account"}
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="p-4 bg-surface-0 border-t border-white/10 text-center text-[10px] text-ink-muted flex items-center justify-between px-6">
        <span>Protected by Firebase Auth</span>
        <span className="font-mono text-ink-secondary">Viral PDF Creator v10.0</span>
      </div>
    </ModalShell>
  );
};
