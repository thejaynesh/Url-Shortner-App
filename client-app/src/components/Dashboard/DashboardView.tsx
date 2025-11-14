import * as React from 'react';
import { UrlData } from '../../interface/UrlData';
import { api } from '../../helpers/api';
import { serverUrl } from '../../helpers/Constants';
import { useAuth } from '../../context/AuthContext';
import QRCodeModal from '../QRCodeModal/QRCodeModal';
import AnalyticsModal from '../AnalyticsModal/AnalyticsModal';

interface IDashboardViewProps {
  onOpenCreateModal?: () => void;
}

type SortOption = 'newest' | 'oldest' | 'most_clicks' | 'least_clicks';

const DashboardView: React.FC<IDashboardViewProps> = () => {
  const { user } = useAuth();
  const [links, setLinks] = React.useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // New link form state
  const [inputUrl, setInputUrl] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [newlyCreated, setNewlyCreated] = React.useState<UrlData | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<SortOption>('newest');

  // Interactive action states
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [selectedQR, setSelectedQR] = React.useState<{ shortUrl: string; fullUrl: string } | null>(null);
  const [selectedAnalyticsCode, setSelectedAnalyticsCode] = React.useState<string | null>(null);

  const getDirectShortUrl = (shortCode: string) => {
    return `${serverUrl.replace(/\/api\/?$/, '')}/${shortCode}`;
  };

  const fetchLinks = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await api.get<UrlData[]>('/shortUrl');
      setLinks(res.data);
    } catch (err: any) {
      console.error('Failed to load links:', err);
      setErrorMessage(err.response?.data?.message || 'Could not load your links. Please check the server connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setNewlyCreated(null);

    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setCreateError('Please enter a destination URL.');
      return;
    }

    const formatted = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      setIsSubmitting(true);
      const res = await api.post<UrlData>('/shortUrl', { fullUrl: formatted });
      setNewlyCreated(res.data);
      setInputUrl('');
      // Refresh list to show newly created item
      fetchLinks();
    } catch (err: any) {
      console.error(err);
      setCreateError(err.response?.data?.message || 'Failed to shorten URL. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(getDirectShortUrl(code));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this short link? Redirects and visit logs for this link will be removed.')) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/shortUrl/${id}`);
      setLinks((prev) => prev.filter((item) => item._id !== id));
      if (newlyCreated?._id === id) {
        setNewlyCreated(null);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete link.');
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics computation
  const totalClicks = React.useMemo(() => {
    return links.reduce((sum, item) => sum + (item.clicks || 0), 0);
  }, [links]);

  const avgClicks = React.useMemo(() => {
    if (links.length === 0) return 0;
    return (totalClicks / links.length).toFixed(1);
  }, [links.length, totalClicks]);

  // Filtering and Sorting
  const processedLinks = React.useMemo(() => {
    let list = [...links];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) => item.fullUrl.toLowerCase().includes(q) || item.shortUrl.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'most_clicks') {
        return (b.clicks || 0) - (a.clicks || 0);
      }
      if (sortBy === 'least_clicks') {
        return (a.clicks || 0) - (b.clicks || 0);
      }
      return 0;
    });

    return list;
  }, [links, searchQuery, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Workspace Overview
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">{user?.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Links & Performance
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLinks}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-1.5"
            title="Refresh link metrics"
          >
            <svg
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Links */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Links</span>
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{links.length}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Managed URLs</div>
        </div>

        {/* Total Clicks */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Clicks</span>
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">{totalClicks}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Direct visitor hits</div>
        </div>

        {/* Average Clicks */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Avg Clicks / Link</span>
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{avgClicks}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Per link conversion</div>
        </div>

        {/* Isolation Status */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Privacy Status</span>
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Owner Gated</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Zero public leakage</div>
        </div>
      </div>

      {/* Quick Create Link Box */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
          Create New Tracked Link
        </h3>

        <form onSubmit={handleCreateLink} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-zinc-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Paste destination URL (e.g. https://github.com/thejaynesh)..."
              required
              disabled={isSubmitting}
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full text-xs sm:text-sm ps-10 pe-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50 shrink-0"
          >
            {isSubmitting ? 'Creating...' : 'Shorten Link'}
          </button>
        </form>

        {createError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs">
            {createError}
          </div>
        )}

        {/* Instant success box for just-created item */}
        {newlyCreated && (
          <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-cyan-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  New Link Active
                </span>
                <span className="text-xs text-zinc-400 truncate max-w-sm">{newlyCreated.fullUrl}</span>
              </div>
              <a
                href={getDirectShortUrl(newlyCreated.shortUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono font-bold text-white hover:text-cyan-400 transition-colors"
              >
                {getDirectShortUrl(newlyCreated.shortUrl)}
              </a>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleCopy(newlyCreated.shortUrl, 'newly_created')}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors border border-zinc-700"
              >
                {copiedId === 'newly_created' ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() =>
                  setSelectedQR({
                    shortUrl: getDirectShortUrl(newlyCreated.shortUrl),
                    fullUrl: newlyCreated.fullUrl,
                  })
                }
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700"
                title="QR Code"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedAnalyticsCode(newlyCreated.shortUrl)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-400 transition-colors border border-zinc-700"
                title="View Analytics"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Link Inventory & Management */}
      <div className="space-y-4">
        {/* Controls Bar: Search & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-zinc-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Filter by destination URL or short code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs ps-9 pe-8 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 end-0 pe-2.5 flex items-center text-zinc-500 hover:text-zinc-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500 shrink-0">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-zinc-700"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_clicks">Most Clicks</option>
              <option value="least_clicks">Least Clicks</option>
            </select>
          </div>
        </div>

        {/* Links Cards List */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {isLoading && links.length === 0 ? (
          <div className="p-16 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
            <div className="w-8 h-8 mx-auto mb-3 border-2 border-zinc-700 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="text-xs text-zinc-400">Loading your workspace links...</p>
          </div>
        ) : processedLinks.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">
              {searchQuery ? 'No matching links found' : 'No links in your workspace yet'}
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
              {searchQuery
                ? `No link matches "${searchQuery}". Clear your search query to see all links.`
                : 'Paste a destination URL in the box above to generate your first tracked short link.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3.5 py-1.5 rounded-lg text-xs bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {processedLinks.map((link) => {
              const fullShortUrl = getDirectShortUrl(link.shortUrl);
              const isCopied = copiedId === link._id;
              const isDeleting = deletingId === link._id;

              return (
                <div
                  key={link._id}
                  className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 transition-all shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Link Info */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      {/* Short Link Pill + Target */}
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={fullShortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                        >
                          <span>{fullShortUrl}</span>
                          <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>

                        {/* Click count trigger pill */}
                        <button
                          onClick={() => setSelectedAnalyticsCode(link.shortUrl)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-zinc-800/80 text-zinc-300 hover:text-cyan-400 border border-zinc-700/80 hover:border-cyan-800 transition-all"
                          title="Open detailed telemetry"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${link.clicks > 0 ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-500'}`}></span>
                          <span>{link.clicks || 0} {link.clicks === 1 ? 'click' : 'clicks'}</span>
                        </button>
                      </div>

                      {/* Destination URL */}
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="text-zinc-600">→</span>
                        <a
                          href={link.fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate max-w-md sm:max-w-xl hover:text-zinc-200 transition-colors"
                          title={link.fullUrl}
                        >
                          {link.fullUrl}
                        </a>
                      </div>

                      {/* Metadata */}
                      <div className="text-[11px] text-zinc-500">
                        Created {new Date(link.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Telemetry Stats Button */}
                      <button
                        onClick={() => setSelectedAnalyticsCode(link.shortUrl)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 transition-colors flex items-center gap-1.5"
                        title="View visitor analytics"
                      >
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Analytics</span>
                      </button>

                      {/* QR Code Button */}
                      <button
                        onClick={() =>
                          setSelectedQR({
                            shortUrl: fullShortUrl,
                            fullUrl: link.fullUrl,
                          })
                        }
                        className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors flex items-center gap-1.5"
                        title="View QR Code"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        <span className="hidden sm:inline">QR</span>
                      </button>

                      {/* Copy Link Button */}
                      <button
                        onClick={() => handleCopy(link.shortUrl, link._id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                          isCopied
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700'
                        }`}
                        title="Copy short link"
                      >
                        {isCopied ? 'Copied' : 'Copy'}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(link._id)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-zinc-700 hover:border-rose-900 transition-colors disabled:opacity-40"
                        title="Delete link"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

export default DashboardView;
