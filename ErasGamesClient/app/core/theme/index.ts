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

const lightColors = {
  // Primary brand colors
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral colors
  background: '#ffffff',
  surface: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',

  // Text colors
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  textOnPrimary: '#ffffff',

  // Interactive states
  disabled: '#cbd5e1',
  placeholder: '#9ca3af',
} as const;

const darkColors = {
  // Primary brand colors
  primary: '#818cf8',
  primaryLight: '#a5b4fc',
  primaryDark: '#6366f1',

  // Semantic colors
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',

  // Neutral colors
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
  border: '#475569',

  // Text colors
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textOnPrimary: '#0f172a',

  // Interactive states
  disabled: '#64748b',
  placeholder: '#6b7280',
} as const;

export const themes = {
  light: {...base, colors: lightColors},
  dark: {...base, colors: darkColors},
} as const;

export type Theme = typeof themes.light;
export type ThemeMode = keyof typeof themes;
