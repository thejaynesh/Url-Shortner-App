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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center text-zinc-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition-colors"
          title="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-cyan-400 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>

        <h3 className="text-base font-bold text-white mb-1">Mobile QR Code</h3>
        <p className="text-xs text-zinc-400 mb-4 truncate" title={fullUrl}>
          Scan to redirect to destination
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl inline-block shadow-md mb-4">
          <img
            src={qrImageUrl}
            alt="QR Code"
            className="w-44 h-44 mx-auto"
          />
        </div>

        {/* Short URL display */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 mb-5 text-left">
          <p className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-0.5">
            Short URL
          </p>
          <p className="text-xs font-mono text-zinc-200 truncate">{shortUrl}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={qrImageUrl}
            download="linkflow-qr.png"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold rounded-xl transition-all shadow-sm text-center"
          >
            Download QR
          </a>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl border border-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
