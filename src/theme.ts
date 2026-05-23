export const colors = {
  // Core
  primary: '#C9A84C',        // Champagne gold — accent, CTAs, highlights
  primaryDark: '#A8883A',    // Pressed state for gold
  background: '#0C0C0E',     // Deep charcoal — screen backgrounds
  surface: '#161618',        // Elevated surface — cards, inputs
  surfaceHigh: '#1F1F22',    // Higher elevation — modals, sheets
  // Text
  textPrimary: '#F0EAD6',    // Warm ivory — headings, primary text
  textSecondary: '#9B9080',  // Warm muted — secondary labels
  textMuted: '#4E4A44',      // Dark muted — hints, placeholders
  // UI
  border: '#2A2820',         // Subtle warm border
  borderLight: '#3A3630',    // Lighter border for focus
  // Semantic
  error: '#E05252',
  success: '#52A882',
  warning: '#C9A84C',
  // Legacy aliases (kept for compatibility)
  secondary: '#C9A84C',
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 52,
} as const;

export const radius = {
  xs: 4,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  round: 999,
} as const;

export const typography = {
  brand: {
    fontSize: 22,
    fontWeight: '800' as const,
    letterSpacing: 6,
    color: colors.textPrimary,
  },
  display: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    lineHeight: 38,
    color: colors.textPrimary,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: colors.textMuted,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  gold: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
