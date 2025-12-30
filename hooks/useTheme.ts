import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const safeGetStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    return null;
  }
  return null;
};

const safeSetStoredTheme = (theme: Theme) => {
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Ignored: storage can be unavailable in some WebViews.
  }
};

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = safeGetStoredTheme();
  if (stored) {
    return stored;
  }

  const documentTheme = document.documentElement.getAttribute('data-theme');
  if (documentTheme === 'dark') {
    return 'dark';
  }

  return 'light';
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    safeSetStoredTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggleTheme };
};
