import axios from "axios";
import { serverUrl } from "./Constants";

export const getClientToken = (): string => {
  let token = localStorage.getItem("linkpulse_client_token");
  if (!token) {
    token = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem("linkpulse_client_token", token);
  }
  return token;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("linkpulse_auth_token");
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("linkpulse_auth_token", token);
  } else {
    localStorage.removeItem("linkpulse_auth_token");
  }
};

export const getStoredUser = () => {
  const userJson = localStorage.getItem("linkpulse_user");
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: any) => {
  if (user) {
    localStorage.setItem("linkpulse_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("linkpulse_user");
  }
};

// Configured Axios instance with auto-injected Auth & Client tokens
export const api = axios.create({
  baseURL: serverUrl,
});

api.interceptors.request.use((config) => {
  const authToken = getAuthToken();
  const clientToken = getClientToken();

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  if (clientToken) {
    config.headers["x-client-token"] = clientToken;
  }

  return config;
});
