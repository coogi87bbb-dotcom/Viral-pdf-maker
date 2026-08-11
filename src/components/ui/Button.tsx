import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

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
  primary:
    'bg-gradient-to-r from-accent-amber-500 via-accent-amber-400 to-accent-amber-500 text-slate-950 ' +
    'shadow-[var(--shadow-glow-amber)] hover:shadow-[0_14px_50px_rgba(245,158,11,0.45)] hover:brightness-105 ' +
    'focus-visible:ring-accent-amber-400',
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
