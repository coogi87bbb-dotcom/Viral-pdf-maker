import React from 'react';
import { Reveal } from './Reveal';

/**
 * 006 — The ledger. Ink zone, mirrored split (copy right, figures left) so it
 * doesn't repeat the capabilities section's left-thesis layout.
 *
 * Same sourcing as LandingStats: the four subscription prices are the
 * published list prices carried in RoiCalculator.tsx's SOFTWARE_STACK_TOOLS.
 */
const LINE_ITEMS: { label: string; manual: string }[] = [
  { label: 'AI copywriter', manual: '$99' },
  { label: 'Social scheduler', manual: '$249' },
  { label: 'Design & thumbnails', manual: '$45' },
  { label: 'Teleprompter app', manual: '$25' },
];

export const LandingMath: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-20">
          {/* Ledger first on desktop, second on mobile — the copy should lead
              on a phone, where the numbers alone lack context. */}
          <div className="order-2 lg:order-1 lg:col-span-6">
            <Reveal kind="slide-right" className="lf-scrim">
              <div className="border-t border-lf-on-ink/20 pt-7">
                <span className="lf-label text-lf-on-ink-muted">The stack you're paying for</span>
                <ul className="mt-6 space-y-0">
                  {LINE_ITEMS.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-baseline justify-between gap-6 border-b border-lf-on-ink/10 py-3.5"
                    >
                      <span className="font-sans text-sm text-lf-on-ink-muted">{item.label}</span>
                      <span className="font-editorial text-xl font-semibold text-lf-on-ink">
                        {item.manual}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex items-baseline justify-between gap-6">
                  <span className="lf-label text-lf-copper-light">Monthly total</span>
                  <span className="font-editorial text-4xl font-bold text-lf-copper-light sm:text-5xl">
                    $418
                  </span>
                </div>
                <p className="mt-3 text-right font-sans text-xs text-lf-on-ink-muted">
                  $5,016 a year — before a single hour of your own time.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-6">
            <Reveal kind="slide-right" delay={0.12}>
              <span className="lf-label text-lf-copper-light">006 / The arithmetic</span>
            </Reveal>
            <Reveal kind="slide-right" delay={0.2} className="mt-6 block">
              <h2 className="lf-heading text-lf-on-ink">
                One workspace,
                <br />
                instead of four
                <br />
                <em className="not-italic text-lf-copper-light">renewals</em>.
              </h2>
            </Reveal>
            <Reveal kind="slide-right" delay={0.3} className="lf-scrim mt-8 block">
              <p className="lf-body text-lf-on-ink-muted">
                The subscriptions are the visible cost. The nine hours a week
                spent stitching their outputs together is the expensive one —
                and it never appears on an invoice.
              </p>
            </Reveal>
            <Reveal kind="slide-right" delay={0.38} className="mt-8 block">
              <hr className="lf-rule text-lf-on-ink" />
              <p className="mt-6 font-editorial text-2xl font-semibold leading-snug text-lf-on-ink sm:text-3xl">
                LogFlow AI collapses both into one login.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingMath;
