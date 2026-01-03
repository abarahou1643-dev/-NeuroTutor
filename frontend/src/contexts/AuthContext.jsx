// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// ✅ IMPORTANT : utiliser le proxy Vite
// Appels => /api/v1/auth/... (et proxy /api -> http://localhost:8081)
const AUTH_BASE = "/api/v1/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const saveUser = (u) => {
    if (!u) return;
    setUser(u);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(u));
  };

  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userLevel");
    localStorage.removeItem("diagnosticResult");
  };

  const refreshMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      clearAuth();
      return null;
    }

    try {
      const res = await fetch(`${AUTH_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.warn("⚠️ /me failed:", res.status);
        return null;
      }

      const data = await res.json();

      const normalizedUser = {
        id: data.userId ?? data.id,
        userId: data.userId ?? data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: String(data.role || "").replace("ROLE_", ""),
        diagnosticCompleted: data.diagnosticCompleted ?? false,
        level: data.level ?? null,
      };

      saveUser(normalizedUser);
      return normalizedUser;
    } catch (e) {
      console.error("❌ refreshMe error:", e);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${AUTH_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = text;
        try {
          const j = JSON.parse(text);
          msg = j.message || text;
        } catch {}
        throw new Error(msg || "Login failed");
      }

      const data = await res.json();

      if (!data?.token) throw new Error("Token manquant dans la réponse login");

      localStorage.setItem("token", data.token);

      const me = await refreshMe();

      if (!me) {
        // fallback si /me échoue
        const fallbackUser = {
          id: data.userId ?? data.id,
          userId: data.userId ?? data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: String(data.role || "").replace("ROLE_", ""),
          diagnosticCompleted: data.diagnosticCompleted ?? false,
        };
        saveUser(fallbackUser);
      }

      return { success: true };
    } catch (e) {
      clearAuth();
      return { success: false, error: e.message };
    }
  };

  const logout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token) {
        setLoading(false);
        return;
      }

      const me = await refreshMe();

      if (!me && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setIsAuthenticated(true);
        } catch {
          clearAuth();
        }
      }

      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
