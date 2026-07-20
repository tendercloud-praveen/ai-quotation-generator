import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, readJSON, writeJSON } from "../lib/storage";

const ThemeContext = createContext(null);

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

function getInitialTheme() {
  const stored = readJSON(STORAGE_KEYS.THEME, null);
  if (stored === THEMES.LIGHT || stored === THEMES.DARK) return stored;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? THEMES.DARK
      : THEMES.LIGHT;
  }
  return THEMES.LIGHT;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === THEMES.DARK) root.classList.add("dark");
    else root.classList.remove("dark");
    writeJSON(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  }, []);

  const value = useMemo(() => ({ theme, toggle, setTheme }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
