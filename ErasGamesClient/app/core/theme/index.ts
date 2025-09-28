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

export const themes = {
  retro: {...base, colors: retroGameTheme.colors},
} as const;

export type Theme = typeof themes.retro;
export type ThemeMode = keyof typeof themes;

// Re-export from ThemeProvider
export {ThemeProvider, useTheme} from './ThemeProvider';

// Re-export theme components
export * from './components';
