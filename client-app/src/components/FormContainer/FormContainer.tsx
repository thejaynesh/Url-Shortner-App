import * as React from 'react';
import { api } from '../../helpers/api';
import { useAuth } from '../../context/AuthContext';

interface IFormContainerProps {
  onUrlCreated: () => void;
}

const FormContainer: React.FC<IFormContainerProps> = ({ onUrlCreated }) => {
  const [fullUrl, setFullUrl] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const { isAuthenticated, user, openAuthModal } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmed = fullUrl.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a valid destination URL.');
      return;
    }

    const formattedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      setIsSubmitting(true);
      await api.post('/shortUrl', {
        fullUrl: formattedUrl,
      });
      setFullUrl('');
      setSuccessMessage('Short URL generated and locked to your private dashboard!');
      onUrlCreated();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error: any) {
      console.error('Error creating short URL:', error);
      const msg = error.response?.data?.message || 'Failed to shorten URL. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10 lg:p-14">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-1/4 -mt-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 -mb-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Private Link & Analytics Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight sm:leading-none mb-4">
            Shorten Links with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-indigo-400">
              Guaranteed Privacy
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Generate clean, lightning-fast short links. Click tracking and visitors count are strictly protected — only you, the creator, can view them.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-slate-950/90 border border-slate-700/80 rounded-2xl p-2 shadow-inner focus-within:border-cyan-400/70 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
              <div className="flex items-center flex-1 ps-3.5 pe-2 py-2">
                <svg
                  className="w-5 h-5 text-indigo-400 shrink-0 me-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Paste long link here (e.g. https://mybrand.com/special-promotion)..."
                  required
                  disabled={isSubmitting}
                  value={fullUrl}
                  onChange={(e) => setFullUrl(e.target.value)}
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 sm:mt-0 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Shorten URL</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs sm:text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs sm:text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Guest sync prompt banner */}
          {!isAuthenticated && (
            <div className="mt-6 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                <span>
                  Tracking links anonymously on this device.{' '}
                  <span className="text-slate-400">Create an account to preserve and access them anywhere.</span>
                </span>
              </div>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white font-semibold text-xs whitespace-nowrap transition-colors"
              >
                Sign Up Free
              </button>
            </div>
          )}

          {isAuthenticated && user && (
            <div className="mt-5 text-xs text-indigo-300 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Logged in as <strong>{user.email}</strong>. Links saved to your personal account.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormContainer;
