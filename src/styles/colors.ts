// Centralized color palettes for light and dark modes
export type ThemeColors = typeof darkColors;

export const darkColors = {
  background: '#0B0B0F',
  surface: '#12121A',
  surfaceElevated: '#161622',
  card: '#191926',
  border: '#202030',
  accent: '#F5B400',
  accentMuted: 'rgba(245, 180, 0, 0.12)',
  textPrimary: '#EDEEF2',
  textSecondary: '#9CA0B5',
  textMuted: '#6E738A',
  success: '#3DD598',
  warning: '#F7C266',
  danger: '#F45B69',
  highlight: '#2C2C3A',
};

export const lightColors: ThemeColors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceElevated: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  accent: '#F5B400',
  accentMuted: 'rgba(245, 180, 0, 0.12)',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  highlight: '#F3F4F6',
};

export type ColorKeys = keyof ThemeColors;
