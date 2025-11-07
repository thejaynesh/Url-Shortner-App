import * as React from 'react';
import { api } from '../../helpers/api';
import { serverUrl } from '../../helpers/Constants';
import { useAuth } from '../../context/AuthContext';
import QRCodeModal from '../QRCodeModal/QRCodeModal';

interface IFormContainerProps {
  onUrlCreated: () => void;
}

interface LatestGeneratedLink {
  fullUrl: string;
  shortUrl: string;
  _id: string;
}

const FormContainer: React.FC<IFormContainerProps> = ({ onUrlCreated }) => {
  const [fullUrl, setFullUrl] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [latestLink, setLatestLink] = React.useState<LatestGeneratedLink | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = React.useState<boolean>(false);

  const { isAuthenticated, user, openAuthModal } = useAuth();

  const getDirectShortUrl = (shortCode: string) => {
    return `${serverUrl.replace(/\/api\/?$/, '')}/${shortCode}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setCopied(false);

    const trimmed = fullUrl.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a valid destination URL.');
      return;
    }

    const formattedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      setIsSubmitting(true);
      const response = await api.post('/shortUrl', {
        fullUrl: formattedUrl,
      });

      setLatestLink({
        fullUrl: response.data.fullUrl,
        shortUrl: response.data.shortUrl,
        _id: response.data._id,
      });

      setFullUrl('');
      onUrlCreated();
    } catch (error: any) {
      console.error('Error creating short URL:', error);
      const msg = error.response?.data?.message || 'Failed to shorten URL. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!latestLink) return;
    const fullShortUrl = getDirectShortUrl(latestLink.shortUrl);
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
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
            Instant Shortener • Optional Private Tracking
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight sm:leading-none mb-4">
            Shorten Links in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-indigo-400">
              One Click
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Free instant link shortening with no login required. Create an account whenever you want to track clicks and view visitor analytics!
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
                    <span>Shortening...</span>
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

          {/* Feedback Error */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs sm:text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Generated Link Result Card */}
          {latestLink && (
            <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-cyan-500/40 shadow-xl shadow-cyan-500/10 text-left animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ✓ Ready to share
                    </span>
                    <span className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                      Destination: {latestLink.fullUrl}
                    </span>
                  </div>

                  <a
                    href={getDirectShortUrl(latestLink.shortUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base sm:text-xl font-mono font-bold text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-1.5"
                  >
                    <span>{getDirectShortUrl(latestLink.shortUrl)}</span>
                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopy}
                    className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="View QR Code"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Call to action for unauthenticated users */}
              {!isAuthenticated ? (
                <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Want to see how many people click this link? Create an account to unlock visit tracking!</span>
                  </div>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="text-cyan-400 hover:text-cyan-300 font-bold whitespace-nowrap hover:underline flex items-center gap-1"
                  >
                    <span>Enable Click Tracking Free</span>
                    <span>→</span>
                  </button>
                </div>
              ) : (
                <div className="mt-4 pt-3.5 border-t border-slate-800 text-xs text-emerald-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>This link is secured under your account ({user?.email}). Real-time click tracking is active below!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal for the newly generated link */}
      {latestLink && qrModalOpen && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          shortUrl={getDirectShortUrl(latestLink.shortUrl)}
          fullUrl={latestLink.fullUrl}
        />
      )}
    </div>
  );
};

export default FormContainer;
