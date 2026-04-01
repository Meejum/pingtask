import { Platform } from 'react-native';

// Lazy import to avoid crashes on web where expo-local-authentication isn't available
let LocalAuth: any = null;

async function getLocalAuth() {
  if (Platform.OS === 'web') return null;
  if (!LocalAuth) {
    try {
      LocalAuth = await import('expo-local-authentication');
    } catch {
      return null;
    }
  }
  return LocalAuth;
}

/**
 * Check if device supports biometric authentication.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const auth = await getLocalAuth();
  if (!auth) return false;

  const compatible = await auth.hasHardwareAsync();
  if (!compatible) return false;

  const enrolled = await auth.isEnrolledAsync();
  return enrolled;
}

/**
 * Get the type of biometric available (Face ID, Touch ID, etc.)
 */
export async function getBiometricType(): Promise<string> {
  const auth = await getLocalAuth();
  if (!auth) return 'None';

  const types = await auth.supportedAuthenticationTypesAsync();
  if (types.includes(auth.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
  if (types.includes(auth.AuthenticationType.FINGERPRINT)) return 'Fingerprint';
  if (types.includes(auth.AuthenticationType.IRIS)) return 'Iris';
  return 'Biometric';
}

/**
 * Prompt user for biometric authentication.
 */
export async function authenticateWithBiometric(
  promptMessage = 'Unlock PingTask',
): Promise<boolean> {
  const auth = await getLocalAuth();
  if (!auth) return true; // Allow access on unsupported platforms

  const result = await auth.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });

  return result.success;
}
