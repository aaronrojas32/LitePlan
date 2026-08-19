import React, { createContext, useContext, useEffect } from 'react';

interface ThemeContextValue {
  theme: 'light';
  resolvedTheme: 'light';
  setTheme: (theme: 'light') => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Ensure dark class is never present
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', resolvedTheme: 'light', setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}
