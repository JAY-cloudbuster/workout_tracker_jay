import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'minimal-luxury' | 'industrial-gym' | 'modern-journal';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'minimal-luxury';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'theme-industrial');

    if (theme === 'minimal-luxury') {
      root.classList.add('dark');
    } else if (theme === 'industrial-gym') {
      root.classList.add('theme-industrial');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
