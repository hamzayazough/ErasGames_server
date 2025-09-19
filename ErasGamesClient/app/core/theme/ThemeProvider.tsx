import React, {createContext, useContext, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {useAppStore} from '../state/appStore';
import {themes, Theme, ThemeMode, EraName} from './index';

const ThemeContext = createContext<Theme>(themes.lover);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const themePref = useAppStore(state => state.theme);
  const currentEra = useAppStore(state => state.currentEra);
  
  const themeMode: ThemeMode = useMemo(() => {
    // If an era is selected, use that theme
    if (currentEra && currentEra in themes) {
      return currentEra as ThemeMode;
    }
    
    // Otherwise use theme preference
    if (themePref === 'system') {
      return systemColorScheme === 'dark' ? 'midnights' : 'lover'; // Use era themes instead of light/dark
    }
    return themePref || 'lover'; // Default to lover theme
  }, [themePref, systemColorScheme, currentEra]);
  
  const theme = useMemo(() => themes[themeMode], [themeMode]);
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}