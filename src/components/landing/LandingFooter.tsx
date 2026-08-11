import React from 'react';
import { Sparkles } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-slate-800/80 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-700 p-0.5 flex items-center justify-center">
            <div className="h-full w-full bg-slate-950 rounded-[8px] flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </div>
          </div>
          <span className="text-sm font-black bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
            Viral PDF Creator
          </span>
        </div>
        <p className="text-xs text-slate-500 text-center sm:text-right">
          Professional PDF Studio &amp; Viral Content Engine &middot; &copy; {year}
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
