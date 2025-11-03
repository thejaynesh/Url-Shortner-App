import * as React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-850 py-8 text-slate-400 text-xs mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
            </svg>
          </div>
          <span className="font-bold text-white text-sm">
            Link<span className="text-cyan-400">Flow</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Owner-Gated Analytics Engine</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            End-to-End Link Isolation
          </div>
          <div>
            Built with React, TypeScript & MongoDB
          </div>
          <div>
            © {new Date().getFullYear()} LinkFlow
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
