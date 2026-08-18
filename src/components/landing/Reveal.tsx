import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

export type RevealKind =
  | 'fade-up'
  | 'slide-left'
  | 'slide-right'
  | 'scale-up'
  | 'clip'
  | 'rise'
  | 'skew-in';

/**
 * Scroll-triggered entrance animation.
 *
 * Every landing section uses a *different* `kind` so no two consecutive
 * sections enter the same way. Children of a section stagger via `delay`
 * (label -> heading -> body -> CTA, ~0.08-0.12s apart).
 *
 * Only `transform` and `opacity` are animated, per the repo's anti-generic
 * guardrails — `clip` animates clipPath, which is likewise compositor-safe.
 *
 * The hidden starting state is applied in useLayoutEffect (synchronously
 * before paint) rather than via a CSS class, so content cannot flash at full
 * opacity on first render. If JS never runs at all, nothing is ever hidden.
 */
const FROM_STATE: Record<RevealKind, gsap.TweenVars> = {
  'fade-up': { opacity: 0, y: 32 },
  'slide-left': { opacity: 0, x: -48 },
  'slide-right': { opacity: 0, x: 48 },
  'scale-up': { opacity: 0, scale: 0.94 },
  clip: { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
  rise: { opacity: 0, y: 64 },
  'skew-in': { opacity: 0, y: 24, skewY: 4 },
};

const TO_STATE: Record<RevealKind, gsap.TweenVars> = {
  'fade-up': { opacity: 1, y: 0 },
  'slide-left': { opacity: 1, x: 0 },
  'slide-right': { opacity: 1, x: 0 },
  'scale-up': { opacity: 1, scale: 1 },
  clip: { opacity: 1, clipPath: 'inset(0 0 0% 0)' },
  rise: { opacity: 1, y: 0 },
  'skew-in': { opacity: 1, y: 0, skewY: 0 },
};

interface RevealProps {
  kind?: RevealKind;
  delay?: number;
  className?: string;
  /** Render as something other than a div (e.g. 'span' inside a heading). */
  as?: 'div' | 'span' | 'li' | 'p';
  /**
   * Play on mount instead of on scroll. Required for anything already inside
   * the first viewport: a scroll trigger set at "top 88%" never fires for an
   * element that starts below that line and is never scrolled past, which
   * silently left the hero's CTA at opacity 0.
   */
  immediate?: boolean;
  children: React.ReactNode;
}

export const Reveal: React.FC<RevealProps> = ({
  kind = 'fade-up',
  delay = 0,
  className = '',
  as = 'div',
  immediate = false,
  children,
}) => {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1, clipPath: 'none' });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(el, FROM_STATE[kind]);
      gsap.to(el, {
        ...TO_STATE[kind],
        duration: kind === 'clip' ? 1.1 : 0.9,
        delay,
        ease: 'power3.out',
        ...(immediate
          ? {}
          : { scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
      });
    }, el);

    return () => ctx.revert();
  }, [kind, delay, immediate, prefersReducedMotion]);

  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {children}
    </Tag>
  );
};

/**
 * Counts a number up when it scrolls into view. Static under reduced motion.
 * `format` renders the running value (thousands separators, currency, etc).
 */
export const CountUp: React.FC<{
  to: number;
  duration?: number;
  className?: string;
  format?: (value: number) => string;
}> = ({ to, duration = 1.6, className = '', format }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const render = (v: number) => {
      el.textContent = format ? format(v) : String(Math.round(v));
    };

    if (prefersReducedMotion) {
      render(to);
      return;
    }

    const counter = { value: 0 };
    render(0);

    const ctx = gsap.context(() => {
      gsap.to(counter, {
        value: to,
        duration,
        ease: 'power2.out',
        onUpdate: () => render(counter.value),
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [to, duration, format, prefersReducedMotion]);

  return <span ref={ref} className={className} />;
};

export default Reveal;
