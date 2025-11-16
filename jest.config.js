/**
 * Jest Configuration for Oma Kulu
 *
 * Configures Jest testing framework for React Native/Expo application with
 * TypeScript support, coverage thresholds, and proper module transformation.
 *
 * @see {@link https://jestjs.io/docs/configuration Jest Configuration Docs}
 * @see {@link https://docs.expo.dev/guides/testing-with-jest/ Expo Testing Guide}
 */
module.exports = {
  // Use jest-expo preset for React Native/Expo-specific transformations and setup
  preset: 'jest-expo',

  // Test file patterns - matches files in __tests__ directories or files ending with .test/.spec
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.{test,spec}.{ts,tsx}',
  ],

  // Files to include in coverage reports (focuses on business logic, excludes UI components)
  collectCoverageFrom: [
    'features/**/*.{ts,tsx}',  // Feature-specific logic
    'lib/**/*.{ts,tsx}',       // Shared utilities and services
    '!**/*.test.{ts,tsx}',     // Exclude test files
    '!**/*.spec.{ts,tsx}',     // Exclude spec files
    '!**/*.d.ts',              // Exclude TypeScript declaration files
    '!**/index.ts',            // Exclude barrel exports
    '!**/types.ts',            // Exclude type definitions
    '!**/*.tsx',               // Exclude React components (focus on business logic)
  ],

  // Minimum coverage requirements - tests must maintain 80% coverage across all metrics
  coverageThreshold: {
    global: {
      statements: 80,  // 80% of statements must be executed
      branches: 80,    // 80% of conditional branches must be tested
      functions: 80,   // 80% of functions must be called
      lines: 80,       // 80% of lines must be executed
    },
  },

  // Setup file to run after test environment is configured (mocks and global setup)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Modules that need to be transformed (React Native and Expo packages)
  // By default, Jest doesn't transform node_modules, but RN/Expo packages need transformation
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
