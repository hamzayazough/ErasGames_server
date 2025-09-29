import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme, useThemeSwitch } from '../../core/theme';

export function ThemeSwitcher() {
  const theme = useTheme();
  const { currentMode, toggleTheme, isMainTheme } = useThemeSwitch();

  return (
    <TouchableOpacity
      style={[
        styles.switcher,
        {
          backgroundColor: theme.colors.buttonSecondary,
          borderColor: theme.colors.border,
        }
      ]}
      onPress={toggleTheme}
    >
      <Text style={[styles.text, { color: theme.colors.text }]}>
        {isMainTheme ? '🎨 Main' : '🕹️ Retro'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  switcher: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
    zIndex: 1000,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});