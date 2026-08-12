import React from 'react';
import { MotionPanel3D } from '../MotionPanel3D';

const STATS: { value: string; label: string }[] = [
  { value: '40', label: 'Master Blueprints' },
  { value: '12', label: 'Teardown Case Studies' },
  { value: '7', label: 'Platforms, One Generation' },
  { value: '3', label: 'Spice Levels — Mild to Nuclear Viral' }
];

export const LandingProof: React.FC = () => {
  return (
    <section className="relative py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionPanel3D tiltX={6} className="w-full" frosted={false}>
          <div className="bg-transparent rounded-2xl border border-white/15 p-6 sm:p-8 shadow-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center space-y-1.5">
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent text-legible">
                    {stat.value}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight text-legible">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs sm:text-sm text-slate-400 text-legible mt-6 pt-6 border-t border-white/10">
              Outmaneuvers Jasper, CopyAI, Taplio, Hypefury, Buffer, and Hootsuite — in one workspace.
            </p>
          </div>
        </MotionPanel3D>
      </div>
    </section>
  );
};

export default LandingProof;
