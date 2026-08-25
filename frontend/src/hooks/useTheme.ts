import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (theme === 'dark') {
    root.classList.remove('system-dark');
    root.classList.add('dark', 'manual-dark');
  } else if (theme === 'system') {
    root.classList.remove('manual-dark');
    if (systemPrefersDark) {
      root.classList.add('dark', 'system-dark');
    } else {
      root.classList.remove('dark', 'system-dark');
    }
  } else {
    root.classList.remove('dark', 'manual-dark', 'system-dark');
  }

  // Keep the browser's own chrome (status bar / address bar area on mobile)
  // in sync with the actual theme, not the hardcoded black it shipped with —
  // read the real value straight from the CSS variable rather than
  // duplicating the color here, so it never drifts if index.css changes.
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    const bgColor = getComputedStyle(root).getPropertyValue('--bg-color').trim();
    if (bgColor) themeColorMeta.setAttribute('content', bgColor);
  }
}

// Single source of truth for theme state, shared across every page.
// Reads/writes the same localStorage key and DOM classes each page used to
// manage independently (and inconsistently).
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) || 'system';
  });

  useEffect(() => {
    applyTheme(theme);

    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return { theme, setTheme };
}
