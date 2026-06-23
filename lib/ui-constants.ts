/**
 * Premium UI Constants
 * Apple-level design system for operator platform
 * Ensures visual coherence across all screens
 */

// Spacing (8px grid)
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
} as const;

// Typography
export const typography = {
  pageTitle: "text-3xl font-black tracking-tight",
  sectionTitle: "text-lg font-bold tracking-tight",
  cardTitle: "text-sm font-semibold",
  label: "text-xs font-semibold uppercase tracking-wider",
  body: "text-sm",
  caption: "text-xs",
  button: "text-xs font-semibold",
} as const;

// Colors
export const colors = {
  // Primary
  dark: "#0D0D0D",
  darkHover: "#333333",
  darkDisabled: "#CCCCCC",

  // Neutral
  white: "#FFFFFF",
  lightGray: "#F9F9F9",
  veryLightGray: "#F5F5F5",
  gray: "#E8E8E8",
  mediumGray: "#999999",
  darkGray: "#666666",
  darkerGray: "#888888",

  // Status
  success: "#0D7C26",
  error: "#C41E3A",
  warning: "#9C4200",

  // Semantic
  text: {
    primary: "#0D0D0D",
    secondary: "#666666",
    tertiary: "#888888",
    disabled: "#CCCCCC",
  },
  bg: {
    primary: "#FFFFFF",
    secondary: "#F9F9F9",
    tertiary: "#F5F5F5",
    disabled: "#E8E8E8",
  },
  border: {
    light: "#E8E8E8",
    dark: "#0D0D0D",
  },
} as const;

// Components
export const components = {
  // Buttons
  button: {
    primary: "px-4 py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-all duration-200",
    secondary: "px-4 py-3 bg-[#F5F5F5] text-[#0D0D0D] text-xs font-semibold rounded-lg hover:bg-[#E8E8E8] disabled:opacity-50 transition-all duration-200",
    tertiary: "px-4 py-2 text-xs font-semibold text-[#0D0D0D] hover:bg-[#F5F5F5] disabled:text-[#CCCCCC] transition-all duration-200",
  },

  // Cards
  card: "border border-[#E8E8E8] rounded-lg bg-white hover:shadow-sm transition-all duration-200",
  cardLight: "border border-[#E8E8E8] rounded-lg bg-[#F9F9F9] hover:bg-white transition-all duration-200",

  // Inputs
  input: "w-full px-4 py-3 border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D0D0D] focus:border-transparent transition-all duration-200",

  // Loading spinner
  spinner: "w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin",
} as const;

// Transitions
export const transitions = {
  fast: "transition-all duration-150",
  normal: "transition-all duration-200",
  slow: "transition-all duration-300",
} as const;

// Shadows
export const shadows = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
} as const;
