import React from 'react';
import {Text as RNText, TextProps as RNTextProps, TextStyle} from 'react-native';
import {useTheme} from '../core/theme/ThemeProvider';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'small';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: keyof ReturnType<typeof useTheme>['colors'];
  center?: boolean;
}

export function Text({
  variant = 'body',
  weight = 'normal',
  color = 'text',
  center = false,
  style,
  ...props
}: TextProps) {
  const theme = useTheme();
  
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {fontSize: theme.text.size['3xl'], fontWeight: theme.text.weight.bold};
      case 'h2':
        return {fontSize: theme.text.size['2xl'], fontWeight: theme.text.weight.semibold};
      case 'h3':
        return {fontSize: theme.text.size.xl, fontWeight: theme.text.weight.semibold};
      case 'body':
        return {fontSize: theme.text.size.md};
      case 'caption':
        return {fontSize: theme.text.size.sm, color: theme.colors.textSecondary};
      case 'small':
        return {fontSize: theme.text.size.xs, color: theme.colors.textMuted};
      default:
        return {fontSize: theme.text.size.md};
    }
  };
  
  return (
    <RNText
      style={[
        getVariantStyle(),
        {
          fontWeight: theme.text.weight[weight],
          color: theme.colors[color],
          ...(center && {textAlign: 'center'}),
        },
        style,
      ]}
      {...props}
    />
  );
}

export default Text;