"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "orbitjobs-theme-preference";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      // eslint-disable-next-line
      setThemeState(savedTheme);
    }
    setMounted(true);
  }, []);

  // Handle updates to theme and resolvedTheme
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (newTheme: ResolvedTheme) => {
      setResolvedTheme(newTheme);
      // We can also add a class to the root element if using Tailwind or utility classes
      if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        applyTheme(e.matches ? "dark" : "light");
      }
    };

    if (theme === "system") {
      applyTheme(mediaQuery.matches ? "dark" : "light");
      mediaQuery.addEventListener("change", handleSystemChange);
    } else {
      applyTheme(theme);
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Prevent hydration mismatch by returning null or a loader until mounted
  // However, for theme providers it's often better to render children to avoid layout shift,
  // even if the theme might flicker. In this case, we have ColorSchemeScript in layout
  // to help, but we still wait for mount to be safe with localStorage.

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
