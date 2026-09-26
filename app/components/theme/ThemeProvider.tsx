'use client';
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check for saved theme in localStorage or use system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemDark) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    // Update document class and save to localStorage
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={theme}>
      {children}
    </div>
  );
}