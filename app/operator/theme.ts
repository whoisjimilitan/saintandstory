// Operator Platform Design System
// Monochrome, calm, minimal
// Linear / Vercel / Notion aesthetic

export const OPERATOR_THEME = {
  // Colors
  colors: {
    // Monochrome palette
    white: '#FFFFFF',
    black: '#0D0D0D',

    // Greys (subtle, calm)
    grey: {
      50: '#F9F9F9',
      100: '#F3F3F3',
      150: '#EEEEEE',
      200: '#E8E8E8',
      300: '#DEDEDE',
      400: '#C9C9C9',
      500: '#A8A8A8',
      600: '#888888',
      700: '#666666',
      800: '#444444',
      900: '#222222',
    },

    // Accent (primary actions only)
    accent: '#0D0D0D', // Black as accent for buttons
    accentHover: '#222222', // Slightly lighter on hover

    // Semantic
    background: '#FFFFFF',
    surface: '#F9F9F9',
    border: '#E8E8E8',
    text: '#0D0D0D',
    textSecondary: '#888888',
    textTertiary: '#C9C9C9',
  },

  // Typography (typography does the work)
  typography: {
    // Font stack
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    },

    // Sizes
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      md: '15px',
      lg: '16px',
      xl: '18px',
      '2xl': '20px',
      '3xl': '24px',
      '4xl': '32px',
    },

    // Font weights (emphasis through weight)
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },

    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing (whitespace is breathing room)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
  },

  // Borders (subtle)
  borders: {
    thin: '1px solid #E8E8E8',
    normal: '1px solid #DEDEDE',
    strong: '2px solid #0D0D0D',
  },

  // Radius (minimal, calm)
  radius: {
    none: '0px',
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
  },

  // Shadows (subtle, not heavy)
  shadows: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },

  // Transitions (fast, responsive)
  transitions: {
    fast: '150ms ease-out',
    normal: '200ms ease-out',
    slow: '300ms ease-out',
  },
} as const;
