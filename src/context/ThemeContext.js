import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const ACCENTS = {
  violet: { primary: "#6366f1", accent: "#8b5cf6" },
  cyan:   { primary: "#06b6d4", accent: "#0891b2" },
  green:  { primary: "#10b981", accent: "#059669" },
  orange: { primary: "#f97316", accent: "#ea580c" },
  pink:   { primary: "#ec4899", accent: "#db2777" },
  red:    { primary: "#ef4444", accent: "#dc2626" },
  amber:  { primary: "#f59e0b", accent: "#d97706" },
  teal:   { primary: "#14b8a6", accent: "#0d9488" },
  blue:   { primary: "#3b82f6", accent: "#2563eb" },
  rose:   { primary: "#f43f5e", accent: "#e11d48" },
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode]       = useState(() => JSON.parse(localStorage.getItem("darkMode") ?? "true"));
  const [compactView, setCompactView] = useState(() => JSON.parse(localStorage.getItem("compactView") ?? "false"));
  const [accentKey, setAccentKey]     = useState(() => localStorage.getItem("accentKey") ?? "violet");

  useEffect(() => {
    const root = document.documentElement;
    const { primary, accent } = ACCENTS[accentKey] ?? ACCENTS.violet;

    root.style.setProperty("--primary", primary);
    root.style.setProperty("--accent",  accent);

    if (darkMode) {
      root.style.setProperty("--bg",        "#070709");
      root.style.setProperty("--card-bg",   "#0f1016");
      root.style.setProperty("--border",    "#1e1f2a");
      root.style.setProperty("--text",      "#f1f5f9");
      root.style.setProperty("--text-muted", "#8b92a9");
    } else {
      root.style.setProperty("--bg",        "#f4f6fb");
      root.style.setProperty("--card-bg",   "#ffffff");
      root.style.setProperty("--border",    "#e2e8f0");
      root.style.setProperty("--text",      "#0f172a");
      root.style.setProperty("--text-muted","#64748b");
    }

    if (compactView) {
      root.style.setProperty("--card-padding", "1rem");
      root.style.setProperty("--gap",          "1rem");
    } else {
      root.style.setProperty("--card-padding", "1.75rem");
      root.style.setProperty("--gap",          "1.5rem");
    }

    localStorage.setItem("darkMode",    JSON.stringify(darkMode));
    localStorage.setItem("compactView", JSON.stringify(compactView));
    localStorage.setItem("accentKey",   accentKey);
  }, [darkMode, compactView, accentKey]);

  const toggleDark    = () => setDarkMode(p => !p);
  const toggleCompact = () => setCompactView(p => !p);
  const setAccent     = (key) => setAccentKey(key);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark, compactView, toggleCompact, accentKey, setAccent, ACCENTS }}>
      {children}
    </ThemeContext.Provider>
  );
};
