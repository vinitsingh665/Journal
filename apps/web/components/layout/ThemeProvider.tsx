"use client";

import React, { useEffect, useState, createContext, useContext } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Accent = 'indigo' | 'blue' | 'emerald' | 'violet';

interface ThemeContextType {
  theme: Theme;
  accent: Accent;
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
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [accent, setAccentState] = useState<Accent>(defaultAccent);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const savedTheme = localStorage.getItem('theme-preference') as Theme;
    const savedAccent = localStorage.getItem('accent-preference') as Accent;
    
    if (savedTheme) setThemeState(savedTheme);
    if (savedAccent) setAccentState(savedAccent);
    
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Handle theme
    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    if (effectiveTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    
    // Handle accent
    root.setAttribute('data-accent', accent);
    
    // Persist to localStorage
    localStorage.setItem('theme-preference', theme);
    localStorage.setItem('accent-preference', accent);
    
  }, [theme, accent, mounted]);

  const value = {
    theme,
    accent,
    setTheme: setThemeState,
    setAccent: setAccentState
  };

  // Prevent hydration mismatch by rendering invisible initially or just raw
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
