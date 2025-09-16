import React from 'react';
import {ViewStyle} from 'react-native';
import {useTheme} from '../core/theme/ThemeProvider';
import View from './View';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  size?: number;
  color?: keyof ReturnType<typeof useTheme>['colors'];
  style?: ViewStyle;
}

export function Separator({
  orientation = 'horizontal',
  size = 1,
  color = 'border',
  style,
}: SeparatorProps) {
  const theme = useTheme();
  
  const separatorStyle: ViewStyle = {
    backgroundColor: theme.colors[color],
    ...(orientation === 'horizontal'
      ? {height: size, width: '100%'}
      : {width: size, height: '100%'}),
  };
  
  return <View style={[separatorStyle, style]} />;
}

export default Separator;