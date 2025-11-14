import * as React from "react";
import { useAuth } from "../../context/AuthContext";

const AuthModal: React.FC = () => {
  const { authModalOpen, authMode, closeAuthModal, setAuthMode, login, register, isLoading } =
    useAuth();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authModalOpen) {
      setErrorMsg(null);
      setPassword("");
    }
  }, [authModalOpen, authMode]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (authMode === "login") {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setErrorMsg("Please enter your name");
          return;
        }
        await register(name, email, password);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Authentication failed. Please check your credentials and try again.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative text-left text-zinc-100">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          title="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Brand header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shadow-sm">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-white font-sans">LinkFlow</h3>
            <p className="text-[11px] text-zinc-400">Private Link Security & Analytics</p>
          </div>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800 mb-5">
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
              authMode === "login"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("register")}
            className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
              authMode === "register"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Security badge notice */}
        <div className="p-3 mb-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-400 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <div className="text-[11px] leading-relaxed">
            <strong className="text-zinc-200 font-semibold">Private Telemetry:</strong> Only you can view click counts and visitor data for links created under your account.
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === "register" && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            {authMode === "register" && (
              <p className="text-[10px] text-zinc-500 mt-1">Must be at least 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-zinc-950" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing...
              </span>
            ) : authMode === "login" ? (
              "Sign In to LinkFlow"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-zinc-400">
          {authMode === "login" ? (
            <span>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className="text-white hover:underline font-medium"
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="text-white hover:underline font-medium"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
