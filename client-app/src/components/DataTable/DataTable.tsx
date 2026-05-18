import * as React from 'react';
import { UrlData } from '../../interface/UrlData';
import { serverUrl } from '../../helpers/Constants';
import axios from 'axios';
import QRCodeModal from '../QRCodeModal/QRCodeModal';

interface IDataTableProps {
  data: UrlData[];
  isLoading: boolean;
  onRefresh: () => void;
}

const DataTable: React.FunctionComponent<IDataTableProps> = ({
  data,
  isLoading,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [selectedQR, setSelectedQR] = React.useState<{ shortUrl: string; fullUrl: string } | null>(null);

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
    if (!window.confirm('Are you sure you want to delete this shortened URL?')) {
      return;
    }

    try {
      setDeletingId(id);
      await axios.delete(`${serverUrl}/shortUrl/${id}`);
      onRefresh();
    } catch (error) {
      console.error('Error deleting URL:', error);
      alert('Failed to delete the URL. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.fullUrl.toLowerCase().includes(q) ||
        item.shortUrl.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
        <div className="flex justify-center items-center gap-3 text-gray-500">
          <svg
            className="animate-spin h-6 w-6 text-blue-600"
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
          <span className="text-base font-medium">Loading shortened URLs...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">No shortened URLs yet</h3>
        <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
          Paste your first link in the form above to generate a short URL and start tracking clicks!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-gray-800">All Shortened Links</h3>
          <p className="text-xs text-gray-500">
            Total {data.length} {data.length === 1 ? 'link' : 'links'} tracked
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs ps-9 pe-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-slate-800 text-white uppercase text-xs tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4 w-5/12 font-semibold">
                  Destination URL
                </th>
                <th scope="col" className="px-6 py-4 w-3/12 font-semibold">
                  Short URL
                </th>
                <th scope="col" className="px-6 py-4 w-2/12 font-semibold text-center">
                  Clicks
                </th>
                <th scope="col" className="px-6 py-4 w-2/12 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">
                    No links match your search "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const fullShortUrl = getDirectShortUrl(item.shortUrl);
                  const isCopied = copiedId === item._id;
                  const isDeleting = deletingId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 break-all">
                        <a
                          href={item.fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          title={item.fullUrl}
                        >
                          {item.fullUrl}
                        </a>
                      </td>

                      <td className="px-6 py-4">
                        <a
                          href={fullShortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          {item.shortUrl}
                          <svg
                            className="w-3 h-3 opacity-60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                          {item.clicks}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* QR Code Action */}
                          <button
                            onClick={() =>
                              setSelectedQR({
                                shortUrl: fullShortUrl,
                                fullUrl: item.fullUrl,
                              })
                            }
                            className="p-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                            title="Show QR Code"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                              />
                            </svg>
                          </button>

                          {/* Copy Action */}
                          <button
                            onClick={() => copyToClipboard(item.shortUrl, item._id)}
                            className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                              isCopied
                                ? 'bg-emerald-100 text-emerald-700 font-semibold'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title="Copy short link"
                          >
                            {isCopied ? (
                              <>
                                <svg
                                  className="w-4 h-4 text-emerald-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>Copied!</span>
                              </>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </button>

                          {/* Delete Action */}
                          <button
                            onClick={() => deleteUrl(item._id)}
                            disabled={isDeleting}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
                            title="Delete URL"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
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

      {/* QR Code Modal */}
      {selectedQR && (
        <QRCodeModal
          isOpen={!!selectedQR}
          onClose={() => setSelectedQR(null)}
          shortUrl={selectedQR.shortUrl}
          fullUrl={selectedQR.fullUrl}
        />
      )}
    </div>
  );
};

export default DataTable;
