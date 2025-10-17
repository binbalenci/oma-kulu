# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-01-15

### 🐛 Fixed

- **iOS Color Picker Issues**
  - Fixed dialog conflict where add dialog would close when color picker opened
  - Implemented seamless dialog handoff system to maintain user context
  - Fixed color overflow issue by making color grid scrollable
  - Added proper ScrollView with 300px max height for color selection
  - Increased dialog height to 500px on iOS to accommodate scrollable content

- **iOS Status Bar & Safe Area Issues**
  - Fixed snackbar positioning to respect safe area and not go behind notch
  - Implemented dynamic positioning that works across all device sizes and platforms
  - Changed status bar style from "light" to "dark" for proper visibility
  - Added cross-platform positioning logic with screen size adaptation
  - Snackbar now positions correctly below header on all iOS devices

### 🔧 Improved

- **Cross-Platform Compatibility**
  - Dynamic snackbar positioning based on platform (iOS/Android) and screen size
  - Percentage-based calculations for different device resolutions
  - Future-proof solution that adapts to new device sizes automatically

### 📱 Platform Support

- Enhanced iOS compatibility with proper safe area handling
- Fixed status bar content visibility on all iOS devices
- Improved responsive design for various iPhone models (SE, 14, 14 Pro Max, etc.)

## [1.0.0-beta] - 2025-01-15

### 🎉 Major Release - Complete UI/UX Overhaul

This beta release represents a complete transformation of the Oma Kulu app with modern UI/UX patterns, emoji-based category system, and enhanced user experience.

### ✨ Added

- **Emoji System for Categories**

  - Replaced icon picker with modern emoji selector
  - Emojis display after colored lines in Categories view
  - CategoryBadge component now shows emojis instead of icons
  - Emoji picker with smooth scrolling and search functionality

- **Enhanced Dialog System**

  - Smooth bottom-up animations for all dialogs
  - Proper scrolling support in emoji picker
  - Confirmation dialogs for all delete actions
  - Improved dialog overlay with blur effects

- **Smart Category Filtering**

  - Home screen dialogs now filter categories by type (income/invoice/budget)
  - Transactions screen shows all categories for flexibility
  - Custom SimpleDropdown component with proper scrolling

- **Improved User Experience**

  - Safe area support for iPhone (notch/speaker compatibility)
  - Compact Cash Overview layout with better visual hierarchy
  - Removed euro icons from amount inputs for cleaner look
  - Enhanced color differentiation for UI elements

- **Code Quality Improvements**
  - Comprehensive TypeScript and ESLint error fixes
  - Removed all unused icon-related code and packages
  - Updated database operations to handle emoji field
  - Clean, maintainable codebase

### 🔧 Changed

- **UI Components**

  - CategoryBadge now uses emoji instead of vector icons
  - Dialog animations are now smooth and consistent
  - Dropdown components have proper scrolling behavior
  - Color scheme improvements for better contrast

- **Database Integration**

  - Updated Category interface to include emoji field
  - Removed temporary emoji filtering from database operations
  - Ready for emoji column in Supabase schema

- **Navigation & Layout**
  - Added proper SafeAreaView support across all screens
  - Improved tab bar with consistent iconography
  - Better spacing and typography throughout the app

### 🗑️ Removed

- Icon picker system and related components
- Unused vector icon packages (kept only necessary UI icons)
- Temporary emoji filtering workarounds
- Redundant icon-related code and imports

### 🐛 Fixed

- Dropdown scrolling issues in category selection
- Safe area overlapping on iPhone devices
- TypeScript errors related to icon system
- ESLint warnings and code quality issues
- Dialog animation performance and smoothness

### 📱 Platform Support

- Enhanced iPhone compatibility with proper safe area handling
- Improved responsive design for various screen sizes
- Better touch targets and accessibility

### 🔮 Known Issues

- Emoji field requires database schema update (add `emoji` column to categories table)
- Some UI elements may need fine-tuning based on user feedback

### 📋 Migration Notes

- Existing categories will show fallback folder icons until emoji is set
- No data migration required - emoji field is optional
- Database schema update needed for full emoji functionality

---

## [0.4.0] - 2024-12-15

### Added

- Basic budget management functionality
- Transaction tracking system
- Category management with icons and colors
- Expected income/invoice planning
- Month-based navigation
- Supabase database integration
- AsyncStorage for local data persistence
- Basic UI components and theme system

### Technical

- React Native with Expo framework
- Expo Router for navigation
- React Native Paper UI components
- Vector icons for categories and UI elements
- Basic animations and transitions
