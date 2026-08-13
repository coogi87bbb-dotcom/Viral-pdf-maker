import React, { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { recordFailure } from '../lib/systemMemory';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Shown in the fallback heading, e.g. "Master Admin". Helps identify
   * which part of the app crashed when multiple boundaries are nested. */
  label?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * The app previously had ZERO error boundaries anywhere — any uncaught
 * render error in any component unmounted the entire React root, producing
 * a silent blank white screen with no on-screen indication of what broke.
 * That is the exact symptom reported for "Master Admin doesn't work" (click
 * does nothing / blank screen), and it could happen for any component, not
 * just AdminDashboard.
 *
 * This boundary renders the real error message and stack directly on
 * screen, since the user reporting the crash may not have (or want to use)
 * DevTools open — the previous failure mode gave neither of us anything to
 * go on.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicit field declarations rather than relying on Component<P, S>'s
  // generics: this repo has no @types/react installed (every other file
  // gets away with it because hook calls like useState() just silently
  // resolve to `any`), so `extends Component<...>` doesn't actually inherit
  // typed `this.props`/`this.state` the normal way — tsc reports them as
  // missing without these.
  declare props: ErrorBoundaryProps;
  declare setState: (state: Partial<ErrorBoundaryState>) => void;
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? ` — ${this.props.label}` : ''}]`, error, info.componentStack);
    // Real persistent memory (see src/lib/systemMemory.ts) — this is the
    // exact crash class ("Master Admin hit an error") that used to vanish
    // the moment the tab closed. Now it's a Firestore record with a
    // signature + occurrence count, visible in Master Admin, that survives
    // reloads/redeploys instead of only living in whatever DevTools
    // console happened to be open when it happened.
    recordFailure(`render:${this.props.label || 'unlabeled'}`, error, info.componentStack?.slice(0, 300));
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-2xl border border-status-danger/30 bg-status-danger-dim/60 p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-status-danger/15 border border-status-danger/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-status-danger" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg text-white">
                  {this.props.label ? `${this.props.label} hit an error` : 'Something went wrong'}
                </h2>
                <p className="text-xs text-ink-muted">This is the actual error — screenshot or copy this to report it.</p>
              </div>
            </div>

            <pre className="text-xs text-status-danger/90 bg-surface-0/80 border border-hairline rounded-xl p-4 overflow-auto max-h-64 whitespace-pre-wrap break-words font-mono">
              {this.state.error.message}
              {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
            </pre>

            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent-rosegold-400 text-slate-950 text-xs font-bold hover:brightness-105 active:scale-[0.98] transition-[transform,filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-rosegold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
