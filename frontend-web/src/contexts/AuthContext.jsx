import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { login as apiLogin, logout as apiLogout, getToken } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[0]));
        setUser({ username: payload.username, role: payload.role, sub: payload.sub });
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await apiLogin(username, password);
    try {
      const payload = JSON.parse(atob(data.access_token.split(".")[0]));
      setUser({ username: payload.username, role: payload.role, sub: payload.sub });
    } catch { /* ignore */ }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    apiLogout();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
