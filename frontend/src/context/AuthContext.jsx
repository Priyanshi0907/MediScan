import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("mediscan_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("mediscan_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem("mediscan_token", token);
    else localStorage.removeItem("mediscan_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("mediscan_user", JSON.stringify(user));
    else localStorage.removeItem("mediscan_user");
  }, [user]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      setToken(data.access_token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (payload) => {
    setLoading(true);
    try {
      const data = await api.signup(payload);
      setToken(data.access_token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, signup, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
