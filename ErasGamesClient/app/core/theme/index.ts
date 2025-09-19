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

// Era Theme Definitions
export type EraName =
  | 'debut'
  | 'fearless'
  | 'speak_now'
  | 'red'
  | '1989'
  | 'reputation'
  | 'lover'
  | 'folklore'
  | 'evermore'
  | 'midnights';

export const eraThemes = {
  debut: {
    name: 'Debut',
    year: '2006',
    emoji: '🌾',
    description: 'Country, fresh, natural — youthful simplicity',
    colors: {
      primary: '#8BA888', // Soft sage green
      primaryLight: '#A5C3A2',
      primaryDark: '#6B8B69',
      accent1: '#87CEEB', // Sky blue
      accent2: '#F5F5DC', // Warm beige
      accent3: '#FFD700', // Golden yellow
      accent4: '#8B7355', // Earthy brown
      background: '#FEFEFE',
      surface: '#F8F8F8',
      card: '#FFFFFF',
      border: '#E8E8E8',
      text: '#2F4F2F',
      textSecondary: '#696969',
      textMuted: '#A9A9A9',
      textOnPrimary: '#FFFFFF',
      success: '#228B22',
      warning: '#DAA520',
      error: '#CD5C5C',
      info: '#4682B4',
      disabled: '#D3D3D3',
      placeholder: '#A9A9A9',
    },
  },

  fearless: {
    name: 'Fearless',
    year: '2008',
    emoji: '✨',
    description: 'Glitter, optimism, fairytale vibes',
    colors: {
      primary: '#FFD700', // Gold
      primaryLight: '#FFED4E',
      primaryDark: '#B8860B',
      accent1: '#F5F5DC', // Cream
      accent2: '#FFFAFA', // Soft white
      accent3: '#F7E7CE', // Champagne
      accent4: '#DAA520', // Warm honey
      background: '#FFFAF0',
      surface: '#FFF8DC',
      card: '#FFFFFF',
      border: '#F0E68C',
      text: '#8B4513',
      textSecondary: '#A0522D',
      textMuted: '#D2B48C',
      textOnPrimary: '#8B4513',
      success: '#32CD32',
      warning: '#FF8C00',
      error: '#DC143C',
      info: '#4169E1',
      disabled: '#F5DEB3',
      placeholder: '#DDD',
    },
  },

  speak_now: {
    name: 'Speak Now',
    year: '2010',
    emoji: '💜',
    description: 'Romantic, whimsical, theatrical',
    colors: {
      primary: '#663399', // Deep purple
      primaryLight: '#9966CC',
      primaryDark: '#4B0082',
      accent1: '#E6E6FA', // Lavender
      accent2: '#C0C0C0', // Silver
      accent3: '#FFC0CB', // Rose pink
      accent4: '#191970', // Midnight blue
      background: '#F8F0FF',
      surface: '#F0E6FF',
      card: '#FFFFFF',
      border: '#DDA0DD',
      text: '#4B0082',
      textSecondary: '#663399',
      textMuted: '#9370DB',
      textOnPrimary: '#FFFFFF',
      success: '#9370DB',
      warning: '#DA70D6',
      error: '#DC143C',
      info: '#6495ED',
      disabled: '#D8BFD8',
      placeholder: '#DDA0DD',
    },
  },

  red: {
    name: 'Red',
    year: '2012',
    emoji: '❤️',
    description: 'Passion, heartbreak, autumn energy',
    colors: {
      primary: '#DC143C', // Crimson red
      primaryLight: '#FF6B6B',
      primaryDark: '#B22222',
      accent1: '#000000', // Black
      accent2: '#FAF0E6', // Off-white
      accent3: '#FF4500', // Burnt orange
      accent4: '#4682B4', // Denim blue
      background: '#FFF8F0',
      surface: '#FFEEE6',
      card: '#FFFFFF',
      border: '#FFB6C1',
      text: '#8B0000',
      textSecondary: '#A52A2A',
      textMuted: '#CD5C5C',
      textOnPrimary: '#FFFFFF',
      success: '#228B22',
      warning: '#FF8C00',
      error: '#FF0000',
      info: '#4682B4',
      disabled: '#F0F0F0',
      placeholder: '#D3D3D3',
    },
  },

  '1989': {
    name: '1989',
    year: '2014',
    emoji: '🌆',
    description: 'Pop polish, retro neon, pastel cityscape vibes',
    colors: {
      primary: '#87CEEB', // Sky blue
      primaryLight: '#B0E0E6',
      primaryDark: '#4682B4',
      accent1: '#FFB6C1', // Bubblegum pink
      accent2: '#DDA0DD', // Pastel purple
      accent3: '#F0FFFF', // Crisp white
      accent4: '#66CDAA', // Seafoam green
      background: '#F0F8FF',
      surface: '#E6F3FF',
      card: '#FFFFFF',
      border: '#B0E0E6',
      text: '#191970',
      textSecondary: '#4682B4',
      textMuted: '#87CEEB',
      textOnPrimary: '#FFFFFF',
      success: '#00CED1',
      warning: '#FF69B4',
      error: '#FF1493',
      info: '#00BFFF',
      disabled: '#E0E0E0',
      placeholder: '#B0C4DE',
    },
  },

  reputation: {
    name: 'Reputation',
    year: '2017',
    emoji: '🖤',
    description: 'Bold, edgy, snake & newspaper aesthetic',
    colors: {
      primary: '#000000', // Black
      primaryLight: '#2F2F2F',
      primaryDark: '#000000',
      accent1: '#36454F', // Charcoal grey
      accent2: '#FFFFFF', // White
      accent3: '#C0C0C0', // Metallic silver
      accent4: '#006400', // Dark emerald
      background: '#1C1C1C',
      surface: '#2A2A2A',
      card: '#333333',
      border: '#555555',
      text: '#FFFFFF',
      textSecondary: '#C0C0C0',
      textMuted: '#808080',
      textOnPrimary: '#FFFFFF',
      success: '#006400',
      warning: '#FFD700',
      error: '#FF4500',
      info: '#4169E1',
      disabled: '#696969',
      placeholder: '#A9A9A9',
    },
  },

  lover: {
    name: 'Lover',
    year: '2019',
    emoji: '💕',
    description: 'Soft, dreamy, romantic pastel tones',
    colors: {
      primary: '#FFB6C1', // Pastel pink
      primaryLight: '#FFCCCB',
      primaryDark: '#FF69B4',
      accent1: '#E0F6FF', // Cotton-candy blue
      accent2: '#E6E6FA', // Lilac
      accent3: '#FFDAB9', // Peach
      accent4: '#FFF8DC', // Cream
      background: '#FFF0F5',
      surface: '#FFEBF0',
      card: '#FFFFFF',
      border: '#FFD0DC',
      text: '#8B0045',
      textSecondary: '#CD5C85',
      textMuted: '#F0A0C0',
      textOnPrimary: '#8B0045',
      success: '#FF69B4',
      warning: '#FFB347',
      error: '#FF1493',
      info: '#87CEEB',
      disabled: '#F5F5F5',
      placeholder: '#DDA0DD',
    },
  },

  folklore: {
    name: 'Folklore',
    year: '2020',
    emoji: '🌲',
    description: 'Indie, woodland, muted storytelling atmosphere',
    colors: {
      primary: '#A9A9A9', // Ash grey
      primaryLight: '#C0C0C0',
      primaryDark: '#696969',
      accent1: '#F5F5F5', // Misty white
      accent2: '#2F2F2F', // Soft black
      accent3: '#228B22', // Forest green
      accent4: '#D2B48C', // Faded taupe
      background: '#F8F8F8',
      surface: '#F0F0F0',
      card: '#FFFFFF',
      border: '#D3D3D3',
      text: '#2F2F2F',
      textSecondary: '#696969',
      textMuted: '#A9A9A9',
      textOnPrimary: '#FFFFFF',
      success: '#228B22',
      warning: '#D2B48C',
      error: '#A52A2A',
      info: '#708090',
      disabled: '#DCDCDC',
      placeholder: '#B0B0B0',
    },
  },

  evermore: {
    name: 'Evermore',
    year: '2020',
    emoji: '🍂',
    description: 'Rustic, autumnal, earthy sister to Folklore',
    colors: {
      primary: '#FF4500', // Burnt orange
      primaryLight: '#FF6347',
      primaryDark: '#CD4F39',
      accent1: '#DAA520', // Mustard yellow
      accent2: '#8B4513', // Warm brown
      accent3: '#006400', // Deep forest green
      accent4: '#F5F5DC', // Cream
      background: '#FFF8DC',
      surface: '#F5DEB3',
      card: '#FFFFFF',
      border: '#DEB887',
      text: '#8B4513',
      textSecondary: '#A0522D',
      textMuted: '#CD853F',
      textOnPrimary: '#FFFFFF',
      success: '#228B22',
      warning: '#DAA520',
      error: '#B22222',
      info: '#4682B4',
      disabled: '#F5DEB3',
      placeholder: '#D2B48C',
    },
  },

  midnights: {
    name: 'Midnights',
    year: '2022',
    emoji: '🌌',
    description: 'Dreamy, introspective, night-sky aesthetic',
    colors: {
      primary: '#191970', // Midnight blue
      primaryLight: '#483D8B',
      primaryDark: '#0F0F23',
      accent1: '#663399', // Deep purple
      accent2: '#0F52BA', // Sapphire
      accent3: '#FFFFFF', // White
      accent4: '#800020', // Burgundy
      background: '#0F0F23',
      surface: '#1A1A2E',
      card: '#16213E',
      border: '#3D5A80',
      text: '#FFFFFF',
      textSecondary: '#B8B8D1',
      textMuted: '#8B8B9A',
      textOnPrimary: '#FFFFFF',
      success: '#663399',
      warning: '#DAA520',
      error: '#DC143C',
      info: '#4169E1',
      disabled: '#555577',
      placeholder: '#777788',
    },
  },
} as const;

// Legacy light/dark themes for compatibility
const lightColors = eraThemes.lover.colors;
const darkColors = eraThemes.midnights.colors;

export const themes = {
  light: {...base, colors: lightColors},
  dark: {...base, colors: darkColors},
  // Add all era themes
  ...Object.fromEntries(
    Object.entries(eraThemes).map(([key, era]) => [
      key,
      {...base, colors: era.colors},
    ]),
  ),
} as const;

export type Theme = typeof themes.light;
export type ThemeMode = keyof typeof themes;

// Helper function to get era info
export const getEraInfo = (era: EraName) => eraThemes[era];

// Helper function to get all eras
export const getAllEras = () => Object.keys(eraThemes) as EraName[];
