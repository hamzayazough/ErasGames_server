import React from 'react';
import {useTheme} from '../ThemeProvider';
import {RetroBackground} from './RetroBackground';
import {MainBackground} from './MainBackground';

interface ThemedBackgroundProps {
  children?: React.ReactNode;
  style?: any;
}

export function ThemedBackground({children, style}: ThemedBackgroundProps) {
  const {currentMode} = useTheme();

  if (currentMode === 'main') {
    return (
      <MainBackground style={style}>
        {children}
      </MainBackground>
    );
  }

  return (
    <RetroBackground style={style}>
      {children}
    </RetroBackground>
  );
}