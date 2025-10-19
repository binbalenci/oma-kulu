// Personal passcode implementation for family sharing protection
// Uses environment variable with obfuscation for casual protection

if (!process.env.EXPO_PUBLIC_PASSCODE) {
  throw new Error('PASSCODE environment variable is required');
}

const ENV_PASSCODE = process.env.EXPO_PUBLIC_PASSCODE;
const OBFUSCATED_PASSCODE = btoa(ENV_PASSCODE); // Base64 encode
const REAL_PASSCODE = atob(OBFUSCATED_PASSCODE);

export async function setPasscode(_passcode: string): Promise<void> {
  // no-op in hardcoded mode - passcode set via environment variable
}

export async function hasPasscode(): Promise<boolean> {
  // always true in hardcoded mode so the UI shows unlock flow
  return true;
}

export async function verifyPasscode(passcode: string): Promise<boolean> {
  return passcode === REAL_PASSCODE;
}

export async function clearPasscode(): Promise<void> {
  // no-op in hardcoded mode
}

