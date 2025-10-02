import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme, useThemeSwitch, ThemedBackground} from '../index';

// Example component showing how to use the theme system
export function ThemeExample() {
  const theme = useTheme();
  const {currentMode, toggleTheme, isMainTheme} = useThemeSwitch();

  return (
    <ThemedBackground style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          Current Theme: {isMainTheme ? 'Main (Pastel Dream)' : 'Retro Game'}
        </Text>
        
        <Text style={[styles.description, {color: theme.colors.textSecondary}]}>
          {isMainTheme 
            ? 'Pastel, dreamy, whimsical with fairytale magic'
            : 'Playful and nostalgic retro game branding'
          }
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            {backgroundColor: theme.colors.buttonPrimary}
          ]}
          onPress={toggleTheme}
        >
          <Text style={[styles.buttonText, {color: theme.colors.textOnPrimary}]}>
            Switch to {isMainTheme ? 'Retro' : 'Main'} Theme
          </Text>
        </TouchableOpacity>

        <View style={styles.colorPalette}>
          <Text style={[styles.paletteTitle, {color: theme.colors.text}]}>
            Color Palette:
          </Text>
          
          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, {backgroundColor: theme.colors.primary}]} />
            <Text style={[styles.colorLabel, {color: theme.colors.textSecondary}]}>
              Primary
            </Text>
          </View>

          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, {backgroundColor: theme.colors.background}]} />
            <Text style={[styles.colorLabel, {color: theme.colors.textSecondary}]}>
              Background
            </Text>
          </View>

          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, {backgroundColor: theme.colors.accent1}]} />
            <Text style={[styles.colorLabel, {color: theme.colors.textSecondary}]}>
              Accent 1
            </Text>
          </View>

          {isMainTheme && (
            <>
              <View style={styles.colorRow}>
                <View style={[styles.colorSwatch, {backgroundColor: theme.colors.sparkle1}]} />
                <Text style={[styles.colorLabel, {color: theme.colors.textSecondary}]}>
                  Sparkle 1
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorPalette: {
    alignItems: 'center',
  },
  paletteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorLabel: {
    fontSize: 14,
  },
});