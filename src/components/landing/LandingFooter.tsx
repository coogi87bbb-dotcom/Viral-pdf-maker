import React from 'react';
import { Reveal } from './Reveal';

export const LandingFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
      <Reveal kind="rise" className="mx-auto block w-full max-w-7xl">
        <div className="flex flex-col gap-8 border-t border-lf-on-ink/15 pt-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-editorial text-3xl font-semibold tracking-[-0.01em] text-lf-on-ink sm:text-4xl">
              LogFlow<span className="text-lf-copper"> AI</span>
            </span>
            <p className="mt-3 max-w-sm font-sans text-sm leading-relaxed text-lf-on-ink-muted">
              Ten production tools in one workspace. Built to give you the week back.
            </p>
          </div>

          <div className="sm:text-right">
            <p className="lf-label text-lf-on-ink-muted">PERAINC PRODUCT {year}</p>
          </div>
        </div>
      </Reveal>
    </footer>
  );
};

export default LandingFooter;
