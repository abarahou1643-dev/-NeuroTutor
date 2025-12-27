// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { firstName, lastName, role, level, diagnosticCompleted, diagnosticScore, ... }
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const isAuthenticated = useMemo(() => {
    return !!localStorage.getItem("token");
  }, [user]); // recalcul quand user change

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshMe = async () => {
    const t = localStorage.getItem("token");
    if (!t) {
      setUser(null);
      return null;
    }

    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        // token expiré ou invalide
        logout();
        return null;
      }

      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (e) {
      console.error("refreshMe error:", e);
      return null;
    }
  };

  // login helper (si tu veux l’utiliser depuis LoginForm)
  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Login failed");
      }

      const data = await res.json(); // { token, refreshToken, ...}
      if (!data?.token) throw new Error("Token manquant dans la réponse");

      localStorage.setItem("token", data.token);

      // après login -> récupérer /me pour user complet
      await refreshMe();

      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // init au démarrage : lire localStorage puis refresh /me
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        // ignore
      }
    }

    (async () => {
      await refreshMe();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
