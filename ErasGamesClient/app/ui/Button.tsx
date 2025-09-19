import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useTheme} from '../core/theme/ThemeProvider';
import Text from './Text';
import View from './View';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  title?: string;
  children?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  title,
  children,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {};
    }
  };
  
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: theme.spacing(3),
          paddingVertical: theme.spacing(1.5),
          borderRadius: theme.radius.sm,
        };
      case 'md':
        return {
          paddingHorizontal: theme.spacing(4),
          paddingVertical: theme.spacing(2.5),
          borderRadius: theme.radius.md,
        };
      case 'lg':
        return {
          paddingHorizontal: theme.spacing(6),
          paddingVertical: theme.spacing(3.5),
          borderRadius: theme.radius.lg,
        };
      default:
        return {};
    }
  };
  
  const getTextColor = () => {
    if (disabled) return theme.colors.disabled;
    
    switch (variant) {
      case 'primary':
        return theme.colors.textOnPrimary;
      case 'outline':
        return theme.colors.primary;
      default:
        return theme.colors.text;
    }
  };
  
  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return theme.text.size.sm;
      case 'lg':
        return theme.text.size.lg;
      default:
        return theme.text.size.md;
    }
  };
  
  const buttonStyle: ViewStyle = {
    ...getVariantStyle(),
    ...getSizeStyle(),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled || loading ? 0.6 : 1,
    ...(fullWidth && {width: '100%'}),
  };
  
  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View row center>
          {leftIcon && <View marginRight={1}>{leftIcon}</View>}
          <Text
            style={[
              {
                color: getTextColor(),
                fontSize: getTextSize(),
                fontWeight: theme.text.weight.medium,
              },
              textStyle,
            ]}
          >
            {title || children}
          </Text>
          {rightIcon && <View marginLeft={1}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default Button;