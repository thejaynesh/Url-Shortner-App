import * as React from 'react';
import { useAuth } from '../../context/AuthContext';

interface INavbarProps {
  onOpenCreateLink?: () => void;
}

const Navbar: React.FC<INavbarProps> = ({ onOpenCreateLink }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-white shadow-sm group-hover:border-zinc-500 transition-colors">
                <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold tracking-tight text-white font-sans">LinkFlow</span>
                {isAuthenticated && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
                    Workspace
                  </span>
                )}
              </div>
            </a>

            {/* Navigation links for logged-out visitors */}
            {!isAuthenticated && (
              <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-zinc-400">
                <a href="#features" className="hover:text-zinc-200 transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-zinc-200 transition-colors">How it Works</a>
                <a
                  href="https://github.com/thejaynesh/Url-Shortner-App"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-200 transition-colors flex items-center gap-1"
                >
                  <span>GitHub</span>
                  <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </nav>
            )}
          </div>

          {/* Right Navigation & Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {onOpenCreateLink && (
                  <button
                    onClick={onOpenCreateLink}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New Link</span>
                  </button>
                )}

                {/* User Profile Pill & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 ps-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80 flex items-center justify-center font-bold text-[10px]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline font-medium text-zinc-200 max-w-[120px] truncate">{user.name}</span>
                    <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 rounded-xl bg-zinc-900 border border-zinc-800 p-1.5 shadow-xl text-xs z-50 animate-fadeIn"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                        <p className="font-semibold text-zinc-200 truncate">{user.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors text-left font-medium"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
