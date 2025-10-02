import {useTheme} from './ThemeProvider';
import {ThemeMode} from './index';

export function useThemeSwitch() {
  const themeContext = useTheme();

  const toggleTheme = () => {
    const newMode: ThemeMode =
      themeContext.currentMode === 'main' ? 'retro' : 'main';
    themeContext.switchTheme(newMode);
  };

  const setMainTheme = () => themeContext.switchTheme('main');
  const setRetroTheme = () => themeContext.switchTheme('retro');

  return {
    currentMode: themeContext.currentMode,
    switchTheme: themeContext.switchTheme,
    toggleTheme,
    setMainTheme,
    setRetroTheme,
    isMainTheme: themeContext.currentMode === 'main',
    isRetroTheme: themeContext.currentMode === 'retro',
  };
}
