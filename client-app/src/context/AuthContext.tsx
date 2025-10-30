import * as React from "react";
import { UserProfile, AuthResponse } from "../interface/AuthData";
import { api, getAuthToken, setAuthToken, getStoredUser, setStoredUser, getClientToken } from "../helpers/api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  authMode: "login" | "register";
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: "login" | "register") => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<UserProfile | null>(() => getStoredUser());
  const [token, setToken] = React.useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = React.useState<boolean>(false);
  const [authMode, setAuthMode] = React.useState<"login" | "register">("login");

  // Validate existing token with /auth/me on initial load
  React.useEffect(() => {
    const verifyToken = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) return;

      try {
        const response = await api.get<{ user: UserProfile }>("/auth/me");
        setUser(response.data.user);
        setStoredUser(response.data.user);
      } catch (err) {
        // Invalid or expired token
        setAuthToken(null);
        setStoredUser(null);
        setUser(null);
        setToken(null);
      }
    };

    verifyToken();
  }, []);

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const clientToken = getClientToken();
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
        clientToken,
      });

      const { token: newToken, user: newUser } = response.data;
      setAuthToken(newToken);
      setStoredUser(newUser);
      setToken(newToken);
      setUser(newUser);
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const clientToken = getClientToken();
      const response = await api.post<AuthResponse>("/auth/register", {
        name,
        email,
        password,
        clientToken,
      });

      const { token: newToken, user: newUser } = response.data;
      setAuthToken(newToken);
      setStoredUser(newUser);
      setToken(newToken);
      setUser(newUser);
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setStoredUser(null);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        authModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        setAuthMode,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
