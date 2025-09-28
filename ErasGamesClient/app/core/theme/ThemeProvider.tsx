import React, {createContext, useContext, useMemo} from 'react';
import {themes, Theme} from './index';

const ThemeContext = createContext<Theme>(themes.retro);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
  // Always use the retro theme for now
  const theme = useMemo(() => themes.retro, []);
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}