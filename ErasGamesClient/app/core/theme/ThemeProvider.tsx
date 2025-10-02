import React, {createContext, useContext, useMemo, useState} from 'react';
import {themes, Theme, ThemeMode} from './index';

interface ThemeContextValue extends Theme {
  // New properties for enhanced theme system
  currentMode: ThemeMode;
  switchTheme: (mode: ThemeMode) => void;
  assets: {
    backgroundImage: any;
    titleImage: any;
  };
  // Keep the theme object for destructuring
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue>({
  ...themes.main,
  theme: themes.main,
  currentMode: 'main',
  switchTheme: () => {},
  assets: {
    backgroundImage: null,
    titleImage: null,
  },
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

export function ThemeProvider({children, defaultTheme = 'main'}: ThemeProviderProps) {
  const [currentMode, setCurrentMode] = useState<ThemeMode>(defaultTheme);

  const themeValue = useMemo(() => {
    const theme = themes[currentMode];
    
    // Define theme-specific assets
    const assets = {
      backgroundImage: currentMode === 'main' 
        ? require('../../assets/images/main-erasgames-background.png')
        : null, // Retro theme uses solid colors, no background image
      titleImage: currentMode === 'main'
        ? require('../../assets/images/main-erasgames-title.png')
        : require('../../assets/images/erasgames-title.png'),
    };

    return {
      // Spread the theme properties directly for backward compatibility
      ...theme,
      // Also provide as nested object for new usage
      theme,
      currentMode,
      switchTheme: setCurrentMode,
      assets,
    };
  }, [currentMode]);
  
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}