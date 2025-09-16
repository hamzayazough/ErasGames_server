import React from 'react';
import {TextInput, TextInputProps, ViewStyle} from 'react-native';
import {useTheme} from '../core/theme/ThemeProvider';
import View from './View';
import Text from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
}

export function Input({
  label,
  error,
  containerStyle,
  size = 'md',
  variant = 'default',
  style,
  ...props
}: InputProps) {
  const theme = useTheme();
  
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: theme.spacing(2.5),
          paddingVertical: theme.spacing(1.5),
          fontSize: theme.text.size.sm,
        };
      case 'lg':
        return {
          paddingHorizontal: theme.spacing(4),
          paddingVertical: theme.spacing(3),
          fontSize: theme.text.size.lg,
        };
      default:
        return {
          paddingHorizontal: theme.spacing(3),
          paddingVertical: theme.spacing(2.5),
          fontSize: theme.text.size.md,
        };
    }
  };
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: error ? theme.colors.error : theme.colors.border,
        };
    }
  };
  
  const inputStyle = {
    ...getSizeStyle(),
    ...getVariantStyle(),
    borderRadius: theme.radius.md,
    color: theme.colors.text,
  };
  
  return (
    <View style={containerStyle}>
      {label && (
        <Text
          variant="caption"
          weight="medium"
          style={{marginBottom: theme.spacing(1)}}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[inputStyle, style]}
        placeholderTextColor={theme.colors.placeholder}
        {...props}
      />
      {error && (
        <Text
          variant="small"
          color="error"
          style={{marginTop: theme.spacing(0.5)}}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

export default Input;