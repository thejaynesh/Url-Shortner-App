import * as React from 'react';
import { api } from '../../helpers/api';
import { serverUrl } from '../../helpers/Constants';
import { useAuth } from '../../context/AuthContext';
import QRCodeModal from '../QRCodeModal/QRCodeModal';

interface LatestGeneratedLink {
  fullUrl: string;
  shortUrl: string;
  _id: string;
}

const LandingView: React.FC = () => {
  const [fullUrl, setFullUrl] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [latestLink, setLatestLink] = React.useState<LatestGeneratedLink | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = React.useState<boolean>(false);

  const { openAuthModal } = useAuth();

  const getDirectShortUrl = (shortCode: string) => {
    return `${serverUrl.replace(/\/api\/?$/, '')}/${shortCode}`;
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setCopied(false);

    const trimmed = fullUrl.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a valid URL.');
      return;
    }

    const formattedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      setIsSubmitting(true);
      const res = await api.post('/shortUrl', { fullUrl: formattedUrl });
      setLatestLink({
        fullUrl: res.data.fullUrl,
        shortUrl: res.data.shortUrl,
        _id: res.data._id,
      });
      setFullUrl('');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to shorten URL. Please check the address and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!latestLink) return;
    try {
      await navigator.clipboard.writeText(getDirectShortUrl(latestLink.shortUrl));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Fast, free redirects with optional private tracking</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Short links built for speed,{' '}
          <span className="text-zinc-400">designed for clarity.</span>
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Convert long links into clean, shareable URLs with zero sign-up required. Create a free account anytime to unlock live click analytics and device telemetry.
        </p>

        {/* Shortener Tool Box */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleShorten} className="w-full">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl focus-within:border-zinc-700 transition-all">
              <div className="flex items-center flex-1 w-full px-3.5 py-2">
                <svg className="w-4 h-4 text-zinc-500 me-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <input
                  type="text"
                  placeholder="Paste your long link (e.g. https://example.com/very-long-url)..."
                  required
                  disabled={isSubmitting}
                  value={fullUrl}
                  onChange={(e) => setFullUrl(e.target.value)}
                  className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Shortening...</span>
                ) : (
                  <>
                    <span>Shorten link</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs text-left">
              {errorMessage}
            </div>
          )}

          {/* Generated Result Card */}
          {latestLink && (
            <div className="mt-5 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-left shadow-lg animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                      ✓ Ready
                    </span>
                    <span className="text-xs text-zinc-500 truncate max-w-xs">{latestLink.fullUrl}</span>
                  </div>
                  <a
                    href={getDirectShortUrl(latestLink.shortUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base sm:text-lg font-mono font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>{getDirectShortUrl(latestLink.shortUrl)}</span>
                    <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopy}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                    }`}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                    title="QR Code"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Account Upsell for Tracking */}
              <div className="mt-4 pt-3.5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <span className="text-zinc-400">
                  Want to track how many people click this link?
                </span>
                <button
                  onClick={() => openAuthModal('register')}
                  className="font-semibold text-white hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <span>Create free account to view analytics</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/40 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">&lt; 50ms</div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">Average Redirect Latency</div>
          </div>
          <div className="p-4 border-t sm:border-t-0 sm:border-x border-zinc-800/80">
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">100%</div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">Owner-Isolated Tracking Privacy</div>
          </div>
          <div className="p-4 border-t sm:border-t-0 border-zinc-800/80">
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">Zero</div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">Mandatory Login Barrier</div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Designed for Utility</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Everything you need from a link engine.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-cyan-400 mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Instant Public Routing</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Anyone can shorten links without signing in. Fast 302 redirects send visitors to their destination in milliseconds.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-indigo-400 mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Visitor Telemetry</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create an account to track clicks, device categories (Mobile vs Desktop), traffic referrers, and recent visit streams.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400 mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Strict Owner Privacy</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Unlike public shorteners where anyone can inspect your click counts, your analytics are strictly locked to your profile.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 px-4 border-t border-zinc-800/80 bg-zinc-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Workflow</h2>
          <h3 className="text-2xl font-bold text-white mb-12">How LinkFlow Works</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs font-mono font-bold text-cyan-400">Step 01</span>
              <h4 className="text-sm font-bold text-white mt-2 mb-1">Paste Any Long URL</h4>
              <p className="text-xs text-zinc-400">No account required. Instant short code generation with automatic HTTPS validation.</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs font-mono font-bold text-cyan-400">Step 02</span>
              <h4 className="text-sm font-bold text-white mt-2 mb-1">Share Link or QR</h4>
              <p className="text-xs text-zinc-400">Copy the clean short link to clipboard or download a vector QR code for mobile scanning.</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs font-mono font-bold text-cyan-400">Step 03</span>
              <h4 className="text-sm font-bold text-white mt-2 mb-1">Unlock Analytics</h4>
              <p className="text-xs text-zinc-400">Log in anytime to see real-time click volume, device form factors, and traffic sources.</p>
            </div>
          </div>

          <div className="mt-12">
            <button
              onClick={() => openAuthModal('register')}
              className="px-6 py-3 rounded-xl font-semibold text-xs bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

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

export default LandingView;
