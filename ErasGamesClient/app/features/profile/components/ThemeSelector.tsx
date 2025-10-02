import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { View, Text } from '../../../ui';
import { useTheme, useThemeSwitch } from '../../../core/theme';

export default function ThemeSelector() {
  const theme = useTheme();
  const { currentMode, toggleTheme, isMainTheme } = useThemeSwitch();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.header}>
        <Text variant="heading3" style={[styles.title, { color: theme.colors.text }]}>
          Theme
        </Text>
        <Text variant="caption" style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Choose your preferred app theme
        </Text>
      </View>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.option,
            { 
              backgroundColor: isMainTheme ? theme.colors.primary : theme.colors.background,
              borderColor: theme.colors.border 
            }
          ]}
          onPress={() => !isMainTheme && toggleTheme()}
          activeOpacity={0.7}
        >
          <View style={styles.optionContent}>
            <Text style={styles.emoji}>🎨</Text>
            <View style={styles.optionText}>
              <Text 
                variant="body" 
                style={[
                  styles.optionTitle, 
                  { color: isMainTheme ? theme.colors.textOnPrimary : theme.colors.text }
                ]}
              >
                Main Theme
              </Text>
              <Text 
                variant="caption" 
                style={[
                  styles.optionDescription, 
                  { color: isMainTheme ? theme.colors.textOnPrimary + '80' : theme.colors.textSecondary }
                ]}
              >
                Modern and clean design
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            { 
              backgroundColor: !isMainTheme ? theme.colors.primary : theme.colors.background,
              borderColor: theme.colors.border 
            }
          ]}
          onPress={() => isMainTheme && toggleTheme()}
          activeOpacity={0.7}
        >
          <View style={styles.optionContent}>
            <Text style={styles.emoji}>🕹️</Text>
            <View style={styles.optionText}>
              <Text 
                variant="body" 
                style={[
                  styles.optionTitle, 
                  { color: !isMainTheme ? theme.colors.textOnPrimary : theme.colors.text }
                ]}
              >
                Retro Theme
              </Text>
              <Text 
                variant="caption" 
                style={[
                  styles.optionDescription, 
                  { color: !isMainTheme ? theme.colors.textOnPrimary + '80' : theme.colors.textSecondary }
                ]}
              >
                Classic gaming vibes
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    lineHeight: 16,
  },
});