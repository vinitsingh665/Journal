"use client";

import React, { useEffect, useState, createContext, useContext } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Accent = 'indigo' | 'blue' | 'emerald' | 'violet';

interface ThemeContextType {
  theme: Theme;
  accent: Accent;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children,
  defaultTheme = 'system',
  defaultAccent = 'blue'
}: { 
  children: React.ReactNode,
  defaultTheme?: Theme,
  defaultAccent?: Accent
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme-preference') as Theme;
      if (savedTheme) return savedTheme;
    }
    return defaultTheme;
  });
  const [accent, setAccentState] = useState<Accent>(() => {
    if (typeof window !== 'undefined') {
      const savedAccent = localStorage.getItem('accent-preference') as Accent;
      if (savedAccent) return savedAccent;
    }
    return defaultAccent;
  });
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme-preference') as Theme;
      if (savedTheme === 'dark') return 'dark';
      if (savedTheme === 'light') return 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme: 'light' | 'dark' = 'light';
    if (theme === 'dark') {
      effectiveTheme = 'dark';
    } else if (theme === 'light') {
      effectiveTheme = 'light';
    } else {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    setResolvedTheme(effectiveTheme);

    if (effectiveTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('dark');
    }

    root.setAttribute('data-accent', accent);

    try {
      localStorage.setItem('theme-preference', theme);
      localStorage.setItem('accent-preference', accent);
    } catch {}
  }, [theme, accent]);

  // System theme changes listener
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const eff = e.matches ? 'dark' : 'light';
      setResolvedTheme(eff);
      const root = document.documentElement;
      if (eff === 'dark') {
        root.setAttribute('data-theme', 'dark');
        root.classList.add('dark');
      } else {
        root.removeAttribute('data-theme');
        root.classList.remove('dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    accent,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setTheme: setThemeState,
    setAccent: setAccentState
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
