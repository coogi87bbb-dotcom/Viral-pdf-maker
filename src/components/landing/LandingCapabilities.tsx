import React from 'react';
import { Reveal } from './Reveal';

/**
 * 005 — The nine tools, as an editorial index rather than a card grid.
 *
 * Deliberately no boxes: rank number, serif name, sans description and a
 * right-aligned time figure carry the hierarchy. A 3x3 card grid is the
 * default AI-slop pattern this page is specifically avoiding.
 */
interface Capability {
  name: string;
  detail: string;
  saving: string;
}

const CAPABILITIES: Capability[] = [
  {
    name: 'Omni-Campaign Factory',
    detail:
      'One topic becomes algorithm-native posts for all seven networks at once, on top of 40 remixable blueprints.',
    saving: '3 hrs → 30 sec',
  },
  {
    name: 'Hook Studio',
    detail:
      'Openers scored for virality across three spice levels, drawn from ten psychological frameworks.',
    saving: 'No more rewrites',
  },
  {
    name: 'Virality Auditor',
    detail:
      'Drafts audited against real algorithm behaviour — retention curve, shadowban risk — before you post.',
    saving: 'Catch it early',
  },
  {
    name: 'Visual & Video Studio',
    detail:
      'Thumbnails, carousels and Pinterest pins, plus an in-browser teleprompter and recorder.',
    saving: 'Two apps replaced',
  },
  {
    name: 'PDF Publishing Studio',
    detail:
      'A raw doc or Google Doc link becomes a designed, high-DPI publication with a 3D cover mockup.',
    saving: 'A weekend → minutes',
  },
  {
    name: 'Digital Kit Studio',
    detail:
      'Fifty-plus ready-to-sell template bundles across six categories, with one-click localisation.',
    saving: '10 hrs / wk',
  },
  {
    name: 'GigScale',
    detail:
      'Pricing tiers, pitch proposals and cold-email sequences for freelance and agency work.',
    saving: 'A week of admin',
  },
  {
    name: 'Deal Closer',
    detail:
      'Seven real-estate tools — commission maths, negotiation scripts, MLS listings, contract timelines.',
    saving: 'Hours → minutes',
  },
  {
    name: 'Agent Ops',
    detail:
      'Ten specialist agents plus a self-healing runtime that catches and repairs errors on its own.',
    saving: 'Zero downtime',
  },
];

export const LandingCapabilities: React.FC = () => {
  return (
    <section id="capabilities" className="relative bg-lf-bone py-24 sm:py-32 lg:py-40">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Split: sticky thesis on the left, the index scrolling on the right */}
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Reveal kind="slide-left">
                <span className="lf-label text-lf-copper-deep">005 / What's inside</span>
              </Reveal>
              <Reveal kind="slide-left" delay={0.1} className="mt-6 block">
                <h2 className="lf-heading text-lf-on-bone">
                  Nine tools that
                  <br />
                  used to be nine
                  <br />
                  <em className="not-italic text-lf-copper">invoices</em>.
                </h2>
              </Reveal>
              <Reveal kind="slide-left" delay={0.2} className="mt-7 block">
                <p className="lf-body text-lf-on-bone-muted">
                  Each one replaces a task you're currently doing by hand, or a
                  subscription you're currently paying for. Usually both.
                </p>
              </Reveal>
            </div>
          </div>

          <ol className="lg:col-span-8">
            {CAPABILITIES.map((cap, i) => (
              <Reveal as="li" key={cap.name} kind="slide-left" delay={0.05 * i}>
                <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2 border-t border-lf-on-bone/15 py-6 sm:gap-x-8 sm:py-7">
                  <span className="lf-label pt-1 text-lf-on-bone-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="font-editorial text-2xl font-semibold leading-tight text-lf-on-bone sm:text-3xl">
                        {cap.name}
                      </h3>
                      <span className="lf-label whitespace-nowrap text-lf-copper">
                        {cap.saving}
                      </span>
                    </div>
                    <p className="mt-2.5 max-w-xl font-sans text-sm leading-relaxed text-lf-on-bone-muted">
                      {cap.detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
            <li aria-hidden="true" className="border-t border-lf-on-bone/15" />
          </ol>
        </div>
      </div>
    </section>
  );
};

export default LandingCapabilities;
