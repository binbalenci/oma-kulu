// Always return light theme for consistency across platforms
export function useColorScheme() {
  return 'light' as const;
}
