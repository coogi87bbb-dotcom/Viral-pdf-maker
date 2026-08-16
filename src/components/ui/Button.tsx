import React from 'react';

export type ButtonVariant = 'primary' | 'brass' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Shared base: every interactive state (hover/focus-visible/active) is
// defined here so no call site can forget one. Only transform/opacity are
// animated (never transition-all) per CLAUDE.md's anti-generic guardrails.
const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
  'transition-[transform,opacity,box-shadow] duration-200 ease-out ' +
  'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0';

const VARIANTS: Record<ButtonVariant, string> = {
  // Copper/rosegold primary — this is now its only real consumer
  // (AuthModal.tsx; the landing page renders its own raw buttons rather
  // than this primitive), so there's no pre-login amber surface left that
  // depends on this staying amber. Matches the app shell's primary accent.
  primary:
    'bg-gradient-to-r from-accent-rosegold-500 via-accent-rosegold-400 to-accent-rosegold-500 text-slate-950 ' +
    'shadow-[var(--shadow-glow-rosegold)] hover:shadow-[0_14px_50px_rgba(192,117,74,0.45)] hover:brightness-105 ' +
    'focus-visible:ring-accent-rosegold-400',
  // Brass primary — the signed-in Studio OS app chrome's actual CTA
  // accent ("Modern Grand Hotel" identity). `primary` above stays rosegold
  // for its one real consumer (AuthModal.tsx, pre-login); every in-app tool
  // surface should reach for `brass` instead of hand-rolling its own
  // gradient button.
  brass:
    'bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 text-slate-950 ' +
    'shadow-[var(--shadow-glow-brass)] hover:shadow-[0_14px_50px_rgba(171,133,68,0.45)] hover:brightness-105 ' +
    'focus-visible:ring-accent-brass-400',
  secondary:
    'bg-surface-2 text-ink-primary border border-accent-violet-500/30 ' +
    'shadow-[var(--shadow-elevated)] hover:border-accent-violet-500/60 hover:bg-surface-3 ' +
    'focus-visible:ring-accent-violet-400',
  ghost:
    'bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-white/5 ' +
    'focus-visible:ring-white/30',
  danger:
    'bg-rose-600 text-white shadow-[0_10px_40px_rgba(225,29,72,0.35)] hover:bg-rose-500 ' +
    'focus-visible:ring-rose-400',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'text-xs px-3.5 py-2',
  md: 'text-xs px-5 py-3',
  lg: 'text-sm px-7 py-3.5',
  // Clears the 44px touch-target minimum the smaller sizes don't quite
  // reach; for a hero-scale primary action.
  xl: 'text-sm px-9 py-4 min-h-[52px]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
