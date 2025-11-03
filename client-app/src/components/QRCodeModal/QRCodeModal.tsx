import * as React from 'react';

interface IQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  fullUrl: string;
}

const QRCodeModal: React.FC<IQRCodeModalProps> = ({
  isOpen,
  onClose,
  shortUrl,
  fullUrl,
}) => {
  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    shortUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">Mobile QR Code</h3>
        <p className="text-xs text-slate-400 mb-4">
          Scan with any mobile camera to instantly test the short redirect
        </p>

        {/* QR Code Container with nice contrast */}
        <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mb-4">
          <img
            src={qrImageUrl}
            alt="QR Code"
            className="w-48 h-48 mx-auto"
          />
        </div>

        {/* Short URL display */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-5 text-left">
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-0.5">
            Target Short Link
          </p>
          <p className="text-xs font-mono text-slate-200 truncate">{shortUrl}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={qrImageUrl}
            download="linkflow-qr.png"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md text-center"
          >
            Download PNG
          </a>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
