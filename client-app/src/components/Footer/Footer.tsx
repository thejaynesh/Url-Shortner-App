import * as React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-800/80 py-8 text-zinc-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
            <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
            </svg>
          </div>
          <span className="font-bold text-white text-xs">LinkFlow</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-500">Fast Shortener & Private Telemetry</span>
        </div>

        <div className="flex items-center gap-5 text-zinc-500 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Systems Operational
          </div>
          <div>React + TypeScript + MongoDB</div>
          <div>© {new Date().getFullYear()} LinkFlow</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
