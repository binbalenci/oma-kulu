/**
 * App Theme System
 * Apple-standard design with vibrant colors and consistent spacing
 */

import { MD3LightTheme } from 'react-native-paper';

export const AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary Colors
    primary: '#2563EB', // Vibrant blue
    primaryContainer: '#3B82F6',

    // Status Colors
    success: '#10B981', // Green
    successLight: '#34D399',
    successDark: '#059669',

    error: '#EF4444', // Red
    errorContainer: '#F87171',

    warning: '#F59E0B', // Orange
    warningLight: '#FBBF24',
    warningDark: '#D97706',

    // Background Colors
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',

    // Card Colors
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',

    // Text Colors
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',

    // Border Colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderDark: '#D1D5DB',

    // Overlay Colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    backdrop: 'rgba(0, 0, 0, 0.3)',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      base: 24,
      lg: 28,
      xl: 28,
      '2xl': 32,
      '3xl': 36,
      '4xl': 40,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Animation timings
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Icon sizes
  iconSize: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    '2xl': 32,
  },

  // Touch targets
  touchTarget: {
    min: 44,
    sm: 36,
    md: 44,
    lg: 48,
  },
} as const;

// Gradient definitions for progress bars
export const ProgressGradients = {
  // Green to yellow to red based on percentage
  getGradientColors: (percentage: number) => {
    if (percentage <= 0.5) {
      // 0-50%: Green shades
      const intensity = percentage * 2; // 0-1
      return [
        `rgba(16, 185, 129, ${0.3 + intensity * 0.4})`, // Green
        `rgba(52, 211, 153, ${0.5 + intensity * 0.3})`, // Light green
      ];
    } else if (percentage <= 0.75) {
      // 50-75%: Yellow-orange
      const intensity = (percentage - 0.5) * 4; // 0-1
      return [
        `rgba(245, 158, 11, ${0.4 + intensity * 0.3})`, // Orange
        `rgba(251, 191, 36, ${0.6 + intensity * 0.2})`, // Yellow
      ];
    } else {
      // 75-100%: Red shades
      const intensity = (percentage - 0.75) * 4; // 0-1
      return [
        `rgba(239, 68, 68, ${0.4 + intensity * 0.4})`, // Red
        `rgba(248, 113, 113, ${0.6 + intensity * 0.3})`, // Light red
      ];
    }
  },

  // Consistent gradient for same percentage
  getGradient: (percentage: number) => {
    const colors = ProgressGradients.getGradientColors(percentage);
    return {
      colors,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    };
  },

};

export type AppThemeType = typeof AppTheme;
