import * as React from 'react';
import axios from 'axios';
import { serverUrl } from '../../helpers/Constants';

interface IFormContainerProps {
  onUrlCreated: () => void;
}

const FormContainer: React.FunctionComponent<IFormContainerProps> = ({ onUrlCreated }) => {
  const [fullUrl, setFullUrl] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmed = fullUrl.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    // Auto-prepend https:// if protocol is omitted
    const formattedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      setIsSubmitting(true);
      await axios.post(`${serverUrl}/shortUrl`, {
        fullUrl: formattedUrl,
      });
      setFullUrl("");
      setSuccessMessage("URL successfully shortened!");
      onUrlCreated();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error("Error creating short URL:", error);
      const msg = error.response?.data?.message || "Failed to shorten URL. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-banner my-6 rounded-2xl shadow-lg overflow-hidden bg-cover bg-center">
        <div className="w-full p-8 md:p-14 backdrop-brightness-75 text-center">
          <h2 className="text-white text-3xl md:text-5xl font-extrabold pb-3 tracking-tight">
            URL Shortener
          </h2>
          <p className="text-blue-100 text-lg md:text-xl font-light max-w-2xl mx-auto pb-6">
            Make long, unwieldy links easy to share, track, and manage in seconds.
          </p>

          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gray-400">
                <svg
                  className="w-5 h-5"
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

              <input
                type="text"
                placeholder="Paste your long URL here (e.g. https://example.com/very-long-link)..."
                required
                disabled={isSubmitting}
                className="block w-full p-4 ps-12 pe-36 text-sm text-gray-900 bg-white rounded-xl border border-gray-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                value={fullUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullUrl(e.target.value)}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute end-2 top-2 bottom-2 px-6 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md flex items-center justify-center disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    Shortening...
                  </span>
                ) : (
                  "Shorten URL"
                )}
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="mt-4 max-w-3xl mx-auto p-3 text-sm text-red-800 bg-red-100 rounded-lg border border-red-200">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 max-w-3xl mx-auto p-3 text-sm text-emerald-800 bg-emerald-100 rounded-lg border border-emerald-200">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormContainer;
