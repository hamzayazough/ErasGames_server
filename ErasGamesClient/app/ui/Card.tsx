import React from 'react';
import {ViewStyle} from 'react-native';
import {useTheme} from '../core/theme/ThemeProvider';
import View from './View';
import Text from './Text';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  padding?: number;
  shadow?: keyof ReturnType<typeof useTheme>['shadows'];
  style?: ViewStyle;
}

export function Card({
  children,
  title,
  subtitle,
  padding = 4,
  shadow = 'md',
  style,
}: CardProps) {
  const theme = useTheme();
  
  return (
    <View
      backgroundColor="card"
      borderRadius="lg"
      shadow={shadow}
      padding={padding}
      style={style}
    >
      {(title || subtitle) && (
        <View marginBottom={title && subtitle ? 2 : 1}>
          {title && (
            <Text variant="h3" weight="semibold">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text variant="caption" style={{marginTop: theme.spacing(0.5)}}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

export default Card;