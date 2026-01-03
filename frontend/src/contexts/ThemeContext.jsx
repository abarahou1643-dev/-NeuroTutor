// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "neurotutor_theme";
const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};

const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || getSystemTheme();
  });

  // ✅ applique la class "dark" + persiste
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);

    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  // ✅ sync si l’utilisateur change le thème dans un autre onglet
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) setTheme(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      isDark: theme === "dark",
      setTheme, // utile si tu veux un bouton "clair/sombre" direct
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
