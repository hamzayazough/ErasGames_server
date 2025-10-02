# ErasGames Theme System

The ErasGames app now supports multiple themes with a sophisticated theme switching system. This document explains how to use and extend the theme system.

## Available Themes

### 1. Main Theme (Default)

- **Style**: Pastel, dreamy, whimsical with fairytale magic
- **Colors**: Lavender → soft pink → pastel blue gradients
- **Background**: Image-based (`main-erasgames-background.png`)
- **Effects**: Magical sparkles and stardust
- **Typography**: Retro-inspired serif with soft gradients

### 2. Retro Theme

- **Style**: Old-school posters and retro game branding
- **Colors**: Teal, orange-red, and cream
- **Background**: Solid colors with sparkle effects
- **Effects**: Glittery sparkles
- **Typography**: Bold, contrasting colors

## Usage

### Basic Theme Usage

```tsx
import React from 'react';
import {View, Text} from 'react-native';
import {useTheme, ThemedBackground} from '../core/theme';

export function MyComponent() {
  const {theme} = useTheme();

  return (
    <ThemedBackground>
      <View style={{backgroundColor: theme.colors.surface}}>
        <Text style={{color: theme.colors.text}}>Hello ErasGames!</Text>
      </View>
    </ThemedBackground>
  );
}
```

### Theme Switching

```tsx
import React from 'react';
import {TouchableOpacity, Text} from 'react-native';
import {useThemeSwitch} from '../core/theme';

export function ThemeToggle() {
  const {toggleTheme, isMainTheme} = useThemeSwitch();

  return (
    <TouchableOpacity onPress={toggleTheme}>
      <Text>Switch to {isMainTheme ? 'Retro' : 'Main'} Theme</Text>
    </TouchableOpacity>
  );
}
```

### Using Theme Assets

```tsx
import React from 'react';
import {Image} from 'react-native';
import {useTheme} from '../core/theme';

export function ThemedTitle() {
  const {assets} = useTheme();

  return <Image source={assets.titleImage} style={{width: 200, height: 50}} />;
}
```

## Theme Structure

Each theme contains:

- **Colors**: Comprehensive color palette including gradients
- **Assets**: Theme-specific images and resources
- **Effects**: Sparkles, glows, and magical elements

### Main Theme Colors

```tsx
{
  // Main gradient: lavender → soft pink → pastel blue
  primary: '#FF69B4',        // Vivid pink for buttons
  gradientStart: '#E6E6FA',  // Lavender
  gradientMiddle: '#FFB6C1', // Soft pink
  gradientEnd: '#B0E0E6',    // Pastel blue

  // Sparkle colors
  sparkle1: '#FFFFE0',       // Pale yellow
  sparkle2: '#F0E68C',       // Golden
  sparkle3: '#FFB6C1',       // Pink
  sparkle4: '#E6E6FA',       // Lavender
  sparkle5: '#B0E0E6',       // Blue

  // Magical effects
  stardust: '#F5DEB3',       // Wheat
  moonbeam: '#F8F8FF',       // Ghost white
  fairyDust: '#FFEFD5',      // Papaya whip
  dreamMist: 'rgba(230, 230, 250, 0.4)', // Semi-transparent mist
  magicGlow: 'rgba(255, 105, 180, 0.3)',  // Pink glow
}
```

## Components

### ThemedBackground

Automatically selects the appropriate background based on the current theme:

- Main theme: Uses image background with sparkle overlay
- Retro theme: Uses solid color background with glitter effects

### MainBackground

Specifically for the main theme with:

- Image background
- Magical sparkle effects
- Gradient overlay for readability

### RetroBackground

Specifically for the retro theme with:

- Solid color background
- Glitter sparkle effects

## Hooks

### useTheme()

Returns the current theme object and assets:

```tsx
const {theme, currentMode, switchTheme, assets} = useTheme();
```

### useThemeSwitch()

Provides theme switching utilities:

```tsx
const {
  currentMode,
  switchTheme,
  toggleTheme,
  setMainTheme,
  setRetroTheme,
  isMainTheme,
  isRetroTheme,
} = useThemeSwitch();
```

## Setting Up the Theme Provider

Wrap your app with the ThemeProvider:

```tsx
import {ThemeProvider} from './core/theme';

export function App() {
  return (
    <ThemeProvider defaultTheme="main">{/* Your app content */}</ThemeProvider>
  );
}
```

## Adding New Themes

To add a new theme:

1. Define the theme colors in `theme/index.ts`
2. Add the theme to the `themes` object
3. Update the `ThemeMode` type
4. Add theme-specific assets to the assets mapping
5. Create theme-specific background component if needed

## Best Practices

1. **Always use theme colors**: Don't hardcode colors, use `theme.colors.*`
2. **Use ThemedBackground**: For consistent background treatment
3. **Test both themes**: Ensure components work well with both themes
4. **Semantic color names**: Use meaningful color names like `textOnPrimary`
5. **Gradients**: Use the gradient utilities for consistent gradient styles

## File Structure

```
theme/
├── index.ts              # Main theme definitions and exports
├── ThemeProvider.tsx     # Theme context and provider
├── useThemeSwitch.ts     # Theme switching hook
├── components/
│   ├── index.ts          # Component exports
│   ├── ThemedBackground.tsx  # Universal background
│   ├── MainBackground.tsx    # Main theme background
│   └── RetroBackground.tsx   # Retro theme background
└── examples/
    ├── index.ts          # Example exports
    └── ThemeExample.tsx  # Complete usage example
```

This theme system provides a solid foundation for creating beautiful, consistent UIs that can adapt to different visual styles while maintaining excellent user experience.
