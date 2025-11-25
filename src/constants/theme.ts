/**
 * Legacy theme - now using AppTheme.ts for comprehensive theming
 * Keeping this for backward compatibility with existing components
 */

import { AppTheme } from './AppTheme';

const tintColorLight = AppTheme.colors.primary;

export const Colors = {
  light: {
    text: AppTheme.colors.textPrimary,
    background: AppTheme.colors.background,
    tint: tintColorLight,
    icon: AppTheme.colors.textSecondary,
    tabIconDefault: AppTheme.colors.textMuted,
    tabIconSelected: tintColorLight,
  },
  // Dark mode removed - always use light
  dark: {
    text: AppTheme.colors.textPrimary,
    background: AppTheme.colors.background,
    tint: tintColorLight,
    icon: AppTheme.colors.textSecondary,
    tabIconDefault: AppTheme.colors.textMuted,
    tabIconSelected: tintColorLight,
  },
};

// Fonts now handled by AppTheme.ts
export const Fonts = AppTheme.typography.fontFamily;
