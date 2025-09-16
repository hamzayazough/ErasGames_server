import React, {createContext, useContext, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {useAppStore} from '../state/appStore';
import {themes, Theme, ThemeMode} from './index';

const ThemeContext = createContext<Theme>(themes.light);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const themePref = useAppStore(state => state.theme);
  
  const themeMode: ThemeMode = useMemo(() => {
    if (themePref === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themePref;
  }, [themePref, systemColorScheme]);
  
  const theme = useMemo(() => themes[themeMode], [themeMode]);
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}