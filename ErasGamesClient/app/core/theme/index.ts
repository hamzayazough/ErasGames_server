const base = {
  spacing: (n: number) => n * 8,
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  text: {
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    weight: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  shadows: {
    sm: {
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

// Retro Game Theme - inspired by old-school posters and retro game branding
const retroGameTheme = {
  name: 'Retro Game',
  description:
    'Playful and nostalgic, reminiscent of old-school posters or retro game branding. Teal, orange-red, and cream create warm, inviting contrast.',
  colors: {
    // Main brand colors from the design - exact matches from the image
    primary: '#E85A3F', // Bright orange-red from the ERAS GAMES text
    primaryLight: '#FF6B4A', // Slightly lighter for highlights
    primaryDark: '#D04A2F', // Darker for pressed states

    // Background and surfaces - exact teal from design
    background: '#4B9B9B', // Rich teal background with slight green undertone
    backgroundDark: '#3A7B7B', // Darker teal for depth/shadows
    surface: '#5BAAAA', // Slightly lighter teal for elevated surfaces
    card: '#FFFFFF', // White cards for content

    // Accent colors - exact cream/beige from countdown
    accent1: '#F4E5B1', // Warm cream/beige from countdown numbers
    accent2: '#F7EBC4', // Very light cream for subtle highlights
    accent3: '#E85A3F', // Orange-red accent (same as primary)
    accent4: '#2A5F5F', // Much darker teal for depth and contrast

    // Text colors
    text: '#E85A3F', // Orange-red for primary text (ERAS GAMES color)
    textSecondary: '#F4E5B1', // Cream for secondary text (NEXT QUIZ IN, etc.)
    textMuted: '#E0D49B', // Slightly muted cream for less important text
    textOnPrimary: '#F4E5B1', // Cream text on orange buttons
    textOnBackground: '#F4E5B1', // Cream text on teal background
    textOnSurface: '#2A5F5F', // Dark teal text on light surfaces

    // Borders and dividers
    border: '#2A5F5F', // Dark teal for borders
    borderLight: '#6BBBBB', // Light teal for subtle borders

    // Status colors (adapted to retro palette)
    success: '#32CD32', // Bright green
    warning: '#FFD700', // Gold
    error: '#DC143C', // Crimson
    info: '#4682B4', // Steel blue

    // Interactive states
    disabled: '#8BAAAA', // Muted teal
    placeholder: '#E0D49B', // Muted cream

    // Button variants
    buttonPrimary: '#E85A3F', // Bright orange-red
    buttonSecondary: '#F4E5B1', // Cream
    buttonOutline: 'transparent',

    // Timer and countdown colors
    timerBackground: 'transparent', // Transparent to show main background
    timerProgress: '#E85A3F', // Orange-red
    timerText: '#F4E5B1', // Cream

    // Special glitter/sparkle effect colors
    glitter1: '#6BDDDD', // Light teal sparkles
    glitter2: '#F7EBC4', // Light cream sparkles
    glitter3: '#8BEEEE', // Very light teal sparkles

    // Additional colors from design assets
    richRed: '#8B2635', // Deep burgundy red from image
    darkRed: '#6B1D2A', // Darker burgundy for depth
    lightRed: '#A53142', // Lighter burgundy for highlights
    rustRed: '#B8342F', // Rust red variant
    warmNeutral: '#E8D5C4', // Warm cream/beige from image
    darkNeutral: '#8B7355', // Darker neutral tone
    lightNeutral: '#F2E8D9', // Very light cream
    charcoal: '#3A3A3A', // Dark charcoal for contrast
  },
} as const;

// Main Theme - Pastel, dreamy, whimsical with fairytale magic
const mainTheme = {
  name: 'Main',
  description:
    'Pastel, dreamy, whimsical design with a touch of fairytale magic. Features soft gradients from lavender to soft pink to pastel blue, with sparkles and magical elements.',
  colors: {
    // Main gradient colors: lavender → soft pink → pastel blue
    primary: '#DA65C6', // Vivid pink for main action buttons (fixed alpha)
    primaryLight: '#FFB6C1', // Light pink for hover states
    primaryDark: '#E91E63', // Darker pink for pressed states

    // Background - will use image background (main-erasgames-background.png)
    background: 'transparent', // Transparent to show image background
    backgroundDark: '#E6E6FA', // Lavender for overlays/modals
    surface: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white for cards
    card: 'rgba(255, 255, 255, 0.9)', // Slightly more opaque for content cards

    // Gradient colors for various elements
    gradientStart: '#E6E6FA', // Lavender
    gradientMiddle: '#FFB6C1', // Soft pink
    gradientEnd: '#B0E0E6', // Pastel blue

    // Accent colors
    accent1: '#FFFFE0', // Pale yellow for stars and sparkles
    accent2: '#F0E68C', // Slightly richer yellow for highlights
    accent3: '#FF69B4', // Vivid pink (same as primary)
    accent4: '#DDA0DD', // Plum for depth and contrast

    // Text colors with good contrast on pastel backgrounds
    text: '#4B0082', // Indigo for primary text (good contrast on pastels)
    textSecondary: '#8B008B', // Dark magenta for secondary text
    textMuted: '#9370DB', // Medium slate blue for muted text
    textOnPrimary: '#FFFFFF', // White text on vivid pink buttons
    textOnBackground: '#4B0082', // Indigo text on light backgrounds
    textOnSurface: '#2F4F4F', // Dark slate gray on white surfaces

    // Borders and dividers
    border: '#DDA0DD', // Plum for borders
    borderLight: 'rgba(221, 160, 221, 0.3)', // Light plum for subtle borders

    // Status colors (adapted to pastel palette)
    success: '#98FB98', // Pale green
    warning: '#F0E68C', // Khaki
    error: '#F08080', // Light coral
    info: '#87CEEB', // Sky blue

    // Interactive states
    disabled: 'rgba(221, 160, 221, 0.5)', // Muted plum
    placeholder: '#C8A2C8', // Light orchid

    // Button variants
    buttonPrimary: '#DA65C6', // Vivid pink
    buttonSecondary: '#E6E6FA', // Lavender
    buttonOutline: 'transparent',

    // Timer and countdown colors
    timerBackground: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white
    timerProgress: '#FF69B4', // Vivid pink
    timerText: '#4B0082', // Indigo

    // Sparkle and magical effect colors
    sparkle1: '#FFFFE0', // Pale yellow sparkles
    sparkle2: '#F0E68C', // Golden sparkles
    sparkle3: '#FFB6C1', // Pink sparkles
    sparkle4: '#E6E6FA', // Lavender sparkles
    sparkle5: '#B0E0E6', // Blue sparkles

    // Gradient definitions for various UI elements
    headerGradient: ['#E6E6FA', '#FFB6C1'], // Lavender to soft pink
    cardGradient: ['rgba(255, 255, 255, 0.9)', 'rgba(240, 230, 240, 0.9)'], // White to light lavender
    buttonGradient: ['#FF69B4', '#FF1493'], // Pink gradient for buttons
    backgroundGradient: ['#E6E6FA', '#FFB6C1', '#B0E0E6'], // Full three-color gradient

    // Additional magical/whimsical colors
    stardust: '#F5DEB3', // Wheat for stardust effects
    moonbeam: '#F8F8FF', // Ghost white for moonbeam effects
    fairyDust: '#FFEFD5', // Papaya whip for fairy dust
    dreamMist: 'rgba(230, 230, 250, 0.4)', // Semi-transparent lavender mist
    magicGlow: 'rgba(255, 105, 180, 0.3)', // Semi-transparent pink glow
  },
} as const;

export const themes = {
  main: {...base, colors: mainTheme.colors},
  retro: {...base, colors: retroGameTheme.colors},
} as const;

export type Theme = typeof themes.main;
export type ThemeMode = keyof typeof themes;

// Re-export from ThemeProvider
export {ThemeProvider, useTheme} from './ThemeProvider';

// Re-export theme components
export * from './components';

// Re-export theme hooks
export {useThemeSwitch} from './useThemeSwitch';

// Theme utility functions
export const createGradientStyle = (
  colors: string[],
  direction: 'horizontal' | 'vertical' = 'vertical',
) => {
  // This would typically use react-native-linear-gradient
  // For now, we'll return the first color as fallback
  return {
    backgroundColor: colors[0],
  };
};

export const getThemeAssets = (mode: ThemeMode) => {
  return {
    backgroundImage:
      mode === 'main'
        ? require('../../assets/images/main-erasgames-background.png')
        : null,
    titleImage:
      mode === 'main'
        ? require('../../assets/images/main-erasgames-title.png')
        : require('../../assets/images/erasgames-title.png'),
  };
};
