import * as React from 'react';
import { UrlData } from '../../interface/UrlData';
import { serverUrl } from '../../helpers/Constants';
import { api } from '../../helpers/api';
import { useAuth } from '../../context/AuthContext';
import QRCodeModal from '../QRCodeModal/QRCodeModal';
import AnalyticsModal from '../AnalyticsModal/AnalyticsModal';

interface IDataTableProps {
  data: UrlData[];
  isLoading: boolean;
  onRefresh: () => void;
}

const DataTable: React.FC<IDataTableProps> = ({
  data,
  isLoading,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [selectedQR, setSelectedQR] = React.useState<{ shortUrl: string; fullUrl: string } | null>(null);
  const [selectedAnalyticsCode, setSelectedAnalyticsCode] = React.useState<string | null>(null);

  const { isAuthenticated, openAuthModal } = useAuth();

  const getDirectShortUrl = (shortCode: string) => {
    return `${serverUrl.replace(/\/api\/?$/, '')}/${shortCode}`;
  };

  const copyToClipboard = async (shortCode: string, id: string) => {
    const fullShortUrl = getDirectShortUrl(shortCode);
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const deleteUrl = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this shortened link?')) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/shortUrl/${id}`);
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting URL:', error);
      const msg = error.response?.data?.message || 'Failed to delete the URL. Please try again.';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const totalClicks = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  }, [data]);

  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.fullUrl.toLowerCase().includes(q) ||
        item.shortUrl.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  // If the user is NOT authenticated, display the clear "Tracking Requires Account" card
  if (!isAuthenticated) {
    return (
      <div className="w-full mt-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-xl mx-auto relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/10">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-3">
            Account Feature
          </span>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Real-Time Click Tracking
          </h3>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            You can generate unlimited short links without logging in. To monitor visit counters, view click statistics, and manage your links, sign in or create a free account.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="text-cyan-400 font-bold mb-0.5">⚡ Live Click Counts</div>
              <div className="text-slate-400 text-[11px]">Real-time visitor logs on every click.</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="text-indigo-400 font-bold mb-0.5">🔒 Private to You</div>
              <div className="text-slate-400 text-[11px]">Nobody else can inspect your tracking.</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="text-emerald-400 font-bold mb-0.5">📋 Link Dashboard</div>
              <div className="text-slate-400 text-[11px]">Search, copy, QR, and delete links.</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/30 transition-all"
            >
              Create Free Account to Track Links
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/60 rounded-2xl p-12 text-center border border-slate-800 mt-8">
        <div className="flex justify-center items-center gap-3 text-slate-400">
          <svg
            className="animate-spin h-6 w-6 text-cyan-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span className="text-sm font-medium">Fetching your private links & analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 mt-8">
      {/* Analytics Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Active Links</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{data.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            Private to your profile
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Clicks Tracked</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{totalClicks}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Live real-time counters
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tracking Privacy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-3">100%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Protected against public snooping
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-12 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Tracked Links Yet</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">
            Paste a link above to generate a short URL. Since you are signed in, its click visits will appear here live!
          </p>
        </div>
      ) : (
        <>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Your Private Short Links</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {data.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Only visible to you. External users can only execute redirects.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by destination or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs ps-9 pe-8 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 end-0 pe-2.5 flex items-center text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Links Table */}
          <div className="w-full bg-slate-900/90 rounded-2xl shadow-xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-4 w-5/12 font-semibold">
                      Destination Address
                    </th>
                    <th scope="col" className="px-6 py-4 w-3/12 font-semibold">
                      Short Link
                    </th>
                    <th scope="col" className="px-6 py-4 w-2/12 font-semibold text-center">
                      Visits (Clicks)
                    </th>
                    <th scope="col" className="px-6 py-4 w-2/12 font-semibold text-right">
                      Controls
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-500 text-sm">
                        No shortened links matched "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => {
                      const fullShortUrl = getDirectShortUrl(item.shortUrl);
                      const isCopied = copiedId === item._id;
                      const isDeleting = deletingId === item._id;

                      return (
                        <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="max-w-md break-all">
                              <a
                                href={item.fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-300 hover:text-cyan-300 font-medium transition-colors hover:underline text-xs sm:text-sm line-clamp-2"
                                title={item.fullUrl}
                              >
                                {item.fullUrl}
                              </a>
                              <div className="text-[11px] text-slate-500 mt-1">
                                Created {new Date(item.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <a
                              href={fullShortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 bg-slate-950 text-cyan-300 rounded-lg border border-slate-700/80 hover:border-cyan-400/80 hover:bg-slate-900 transition-all shadow-sm"
                            >
                              <span>{item.shortUrl}</span>
                              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setSelectedAnalyticsCode(item.shortUrl)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900/60 hover:border-cyan-400 transition-all shadow-sm group"
                              title="Click to view detailed visitor analytics & telemetry"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                              <span>{item.clicks} {item.clicks === 1 ? 'click' : 'clicks'}</span>
                              <svg className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {/* Analytics Details Button */}
                              <button
                                onClick={() => setSelectedAnalyticsCode(item.shortUrl)}
                                className="p-2 rounded-xl text-xs font-medium bg-indigo-950/50 text-cyan-300 hover:text-white hover:bg-indigo-900/60 border border-indigo-800/50 hover:border-cyan-400/60 transition-all flex items-center gap-1"
                                title="Inspect detailed visitor analytics"
                              >
                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span className="hidden sm:inline font-semibold">Stats</span>
                              </button>

                              {/* QR Code Button */}
                              <button
                                onClick={() =>
                                  setSelectedQR({
                                    shortUrl: fullShortUrl,
                                    fullUrl: item.fullUrl,
                                  })
                                }
                                className="p-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 border border-slate-700 transition-all"
                                title="View QR Code"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                              </button>

                              {/* Copy Link Button */}
                              <button
                                onClick={() => copyToClipboard(item.shortUrl, item._id)}
                                className={`p-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 border ${
                                  isCopied
                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600 font-bold'
                                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700'
                                }`}
                                title="Copy Short Link"
                              >
                                {isCopied ? (
                                  <>
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="hidden sm:inline">Copied</span>
                                  </>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </button>

                              {/* Delete Link Button */}
                              <button
                                onClick={() => deleteUrl(item._id)}
                                disabled={isDeleting}
                                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-900 transition-colors disabled:opacity-40"
                                title="Delete this link"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* QR Code Modal */}
      {selectedQR && (
        <QRCodeModal
          isOpen={!!selectedQR}
          onClose={() => setSelectedQR(null)}
          shortUrl={selectedQR.shortUrl}
          fullUrl={selectedQR.fullUrl}
        />
      )}

      {/* Analytics Modal */}
      {selectedAnalyticsCode && (
        <AnalyticsModal
          isOpen={!!selectedAnalyticsCode}
          onClose={() => setSelectedAnalyticsCode(null)}
          shortCode={selectedAnalyticsCode}
        />
      )}
    </div>
  );
};

export default DataTable;
