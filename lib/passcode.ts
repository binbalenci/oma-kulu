// Temporary hardcoded passcode implementation to support web without SecureStore.
// Replace with SecureStore-based storage when shipping to devices.

const HARDCODED_PASSCODE = '1827';

export async function setPasscode(_passcode: string): Promise<void> {
  // no-op in hardcoded mode
}

export async function hasPasscode(): Promise<boolean> {
  // always true in hardcoded mode so the UI shows unlock flow
  return true;
}

export async function verifyPasscode(passcode: string): Promise<boolean> {
  return passcode === HARDCODED_PASSCODE;
}

export async function clearPasscode(): Promise<void> {
  // no-op in hardcoded mode
}

