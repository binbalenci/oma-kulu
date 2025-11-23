/**
 * Jest Setup and Global Mocks for Oma Kulu
 *
 * This file runs after the test environment is set up but before tests execute.
 * It configures mocks for external dependencies that don't work in the Jest test environment,
 * including database clients, native modules, and UI libraries.
 *
 * @see {@link https://jestjs.io/docs/configuration#setupfilesafterenv-array Jest Setup Files}
 */

/**
 * Mock Supabase Client
 *
 * Mocks the Supabase database client to prevent actual database calls during tests.
 * Provides mock implementations of common Supabase methods (from, auth.getSession).
 */
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(), // Mock database query builder
    auth: { getSession: jest.fn() }, // Mock authentication session retrieval
  },
}));

/**
 * Mock Expo Router
 *
 * Mocks Expo Router navigation hooks since they depend on the React Navigation context
 * which isn't available in the Jest test environment.
 */
jest.mock('expo-router', () => ({
  useRouter: jest.fn(), // Mock navigation router hook
  useSegments: jest.fn(), // Mock URL segments hook
  useLocalSearchParams: jest.fn(), // Mock query parameters hook
}));

/**
 * Mock Expo Secure Store
 *
 * Mocks the native secure storage module (used for passcode session management).
 * The actual module requires native iOS/Android APIs that aren't available in Jest.
 */
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(), // Mock secure item retrieval
  setItemAsync: jest.fn(), // Mock secure item storage
  deleteItemAsync: jest.fn(), // Mock secure item deletion
}));

/**
 * Mock React Native Paper
 *
 * Partially mocks React Native Paper UI library. Uses the real module for most components
 * but simplifies the Provider to avoid theme context setup complexity in tests.
 */
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  return {
    ...RealModule,
    // Simplify Provider to just render children without theme context
    Provider: ({ children }) => children,
  };
});

/**
 * Mock Logger
 *
 * Mocks the application logger that depends on Sentry.
 * Provides no-op implementations for all logging methods.
 */
jest.mock('@/app/utils/logger', () => ({
  default: {
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    breadcrumb: jest.fn(),
    navigationAction: jest.fn(),
    userAction: jest.fn(),
    dataAction: jest.fn(),
    databaseError: jest.fn(),
    performanceWarning: jest.fn(),
  },
}));
