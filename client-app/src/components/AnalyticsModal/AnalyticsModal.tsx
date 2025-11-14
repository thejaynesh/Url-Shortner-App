import * as React from 'react';
import { DetailedLinkStats } from '../../interface/AnalyticsData';
import { api } from '../../helpers/api';
import { serverUrl } from '../../helpers/Constants';

interface IAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortCode: string;
}

const AnalyticsModal: React.FC<IAnalyticsModalProps> = ({
  isOpen,
  onClose,
  shortCode,
}) => {
  const [data, setData] = React.useState<DetailedLinkStats | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);

  const getDirectShortUrl = (code: string) => {
    return `${serverUrl.replace(/\/api\/?$/, '')}/${code}`;
  };

  React.useEffect(() => {
    if (!isOpen || !shortCode) return;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const res = await api.get<DetailedLinkStats>(`/shortUrl/stats/${shortCode}`);
        setData(res.data);
      } catch (err: any) {
        console.error('Failed to fetch analytics:', err);
        setErrorMsg(err.response?.data?.message || 'Failed to load tracking analytics.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isOpen, shortCode]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(getDirectShortUrl(data.shortUrl));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const getTopKey = (record: Record<string, number> | undefined) => {
    if (!record || Object.keys(record).length === 0) return 'None';
    return Object.entries(record).sort((a, b) => b[1] - a[1])[0][0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative text-left text-zinc-100 my-8 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-zinc-800 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                Live Telemetry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Tracking:</span>
              <span className="font-mono text-cyan-300">/{shortCode}</span>
            </h2>
            {data && (
              <p className="text-xs text-zinc-400 truncate max-w-lg mt-0.5">
                Target:{' '}
                <a
                  href={data.fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-cyan-400"
                >
                  {data.fullUrl}
                </a>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700'
              }`}
            >
              {copied ? 'Copied' : 'Copy Link'}
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
              title="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 pe-1 py-4 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-zinc-700 border-t-cyan-400 rounded-full animate-spin"></div>
              <span className="text-xs font-medium text-zinc-400">Loading visit telemetry...</span>
            </div>
          ) : errorMsg ? (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs text-center">
              {errorMsg}
            </div>
          ) : data && (
            <>
              {/* 4 Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
                  <div className="text-[11px] font-medium text-zinc-400 mb-1">Total Clicks</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">{data.clicks}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Direct visits recorded</div>
                </div>

                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
                  <div className="text-[11px] font-medium text-zinc-400 mb-1">Top Device</div>
                  <div className="text-lg sm:text-xl font-bold text-white truncate">{getTopKey(data.analytics?.devices)}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Primary form factor</div>
                </div>

                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
                  <div className="text-[11px] font-medium text-zinc-400 mb-1">Top Referrer</div>
                  <div className="text-lg sm:text-xl font-bold text-indigo-300 truncate">{getTopKey(data.analytics?.referrers)}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Leading traffic source</div>
                </div>

                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
                  <div className="text-[11px] font-medium text-zinc-400 mb-1">Top Browser</div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-400 truncate">{getTopKey(data.analytics?.browsers)}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Leading browser engine</div>
                </div>
              </div>

              {/* 7-Day Click Timeline Chart */}
              {data.analytics?.timeline && data.analytics.timeline.length > 0 && (
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-zinc-400">7-Day Click Volume</span>
                    <span className="text-cyan-400 font-mono text-[11px]">Past 7 Days</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4">
                    {data.analytics.timeline.map((item) => {
                      const maxCount = Math.max(...data.analytics.timeline.map((t) => t.count), 1);
                      const heightPercent = Math.max(Math.round((item.count / maxCount) * 100), item.count > 0 ? 12 : 4);
                      const dayLabel = new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' });

                      return (
                        <div key={item.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                          <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover:text-cyan-400 transition-colors">
                            {item.count}
                          </span>
                          <div className="w-full bg-zinc-800/70 rounded-lg h-full flex items-end overflow-hidden p-0.5">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full bg-cyan-500/80 rounded-md transition-all duration-500 group-hover:bg-cyan-400"
                            ></div>
                          </div>
                          <span className="text-[10px] text-zinc-500">{dayLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2-Column Breakdown: Devices & Traffic Sources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Devices */}
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-xs font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Device Distribution</span>
                  </h4>

                  {Object.keys(data.analytics?.devices || {}).length === 0 ? (
                    <div className="text-zinc-500 text-xs py-4 text-center">No device visits logged yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(data.analytics.devices).map(([dev, count]) => {
                        const pct = Math.round((count / (data.clicks || 1)) * 100);
                        return (
                          <div key={dev} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-zinc-300">{dev}</span>
                              <span className="text-zinc-400 font-mono">{count} clicks ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className="h-full bg-cyan-500 rounded-full"
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Referrers */}
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-xs font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    </svg>
                    <span>Traffic Sources (Referrers)</span>
                  </h4>

                  {Object.keys(data.analytics?.referrers || {}).length === 0 ? (
                    <div className="text-zinc-500 text-xs py-4 text-center">No referrer data logged yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(data.analytics.referrers).map(([ref, count]) => {
                        const pct = Math.round((count / (data.clicks || 1)) * 100);
                        return (
                          <div key={ref} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-zinc-300 truncate max-w-[180px]">{ref}</span>
                              <span className="text-zinc-400 font-mono">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className="h-full bg-indigo-500 rounded-full"
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Operating System & Browser Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Browsers */}
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-xs font-semibold text-zinc-400 mb-3">
                    Browsers
                  </h4>
                  <div className="space-y-2.5">
                    {Object.entries(data.analytics?.browsers || {}).map(([b, count]) => {
                      const pct = Math.round((count / (data.clicks || 1)) * 100);
                      return (
                        <div key={b} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-300">{b}</span>
                            <span className="text-zinc-400 font-mono">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div style={{ width: `${pct}%` }} className="h-full bg-zinc-400 rounded-full"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Operating Systems */}
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-xs font-semibold text-zinc-400 mb-3">
                    Operating Systems
                  </h4>
                  <div className="space-y-2.5">
                    {Object.entries(data.analytics?.os || {}).map(([osName, count]) => {
                      const pct = Math.round((count / (data.clicks || 1)) * 100);
                      return (
                        <div key={osName} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-300">{osName}</span>
                            <span className="text-zinc-400 font-mono">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div style={{ width: `${pct}%` }} className="h-full bg-zinc-400 rounded-full"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Click Activity Log */}
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-400">
                    Recent Visitor Stream (Last {data.analytics?.recentActivity?.length || 0})
                  </span>
                  <span className="text-emerald-400 text-[10px] font-mono">Live</span>
                </div>

                {(!data.analytics?.recentActivity || data.analytics.recentActivity.length === 0) ? (
                  <div className="text-zinc-500 text-xs py-6 text-center">
                    No visit events recorded yet. Share your short link to capture detailed visitor metrics!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                        <tr>
                          <th className="py-2 px-3">Time</th>
                          <th className="py-2 px-3">Device & OS</th>
                          <th className="py-2 px-3">Browser</th>
                          <th className="py-2 px-3">Referrer</th>
                          <th className="py-2 px-3 text-right">Country</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 font-mono">
                        {data.analytics.recentActivity.map((log, idx) => (
                          <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="py-2.5 px-3 text-zinc-400 font-sans">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{' '}
                              <span className="text-[10px] text-zinc-500">({new Date(log.timestamp).toLocaleDateString()})</span>
                            </td>
                            <td className="py-2.5 px-3 text-zinc-200">
                              {log.device} • {log.os}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-300">
                              {log.browser}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-400 max-w-[150px] truncate font-sans">
                              {log.referrer}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-cyan-300 border border-zinc-700">
                                {log.country || 'Global'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;
