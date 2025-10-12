import * as React from 'react';

interface IQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  fullUrl: string;
}

const QRCodeModal: React.FunctionComponent<IQRCodeModalProps> = ({
  isOpen,
  onClose,
  shortUrl,
  fullUrl,
}) => {
  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    shortUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
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

        <h3 className="text-xl font-bold text-gray-800 mb-1">QR Code</h3>
        <p className="text-xs text-gray-500 mb-4">
          Scan to quickly open this link on a mobile device
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-gray-50 rounded-xl inline-block border border-gray-100 shadow-inner mb-4">
          <img
            src={qrImageUrl}
            alt="QR Code"
            className="w-48 h-48 mx-auto rounded-lg shadow-sm"
          />
        </div>

        {/* Short URL link */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 mb-4 text-left">
          <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-0.5">
            Short Link
          </p>
          <p className="text-sm font-mono text-blue-700 truncate">{shortUrl}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={qrImageUrl}
            download="qrcode.png"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm text-center"
          >
            Download QR
          </a>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
