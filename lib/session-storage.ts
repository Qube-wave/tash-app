import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'tash.refreshToken';
let memoryRefreshToken: string | null = null;

async function canUseSecureStore() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

function requiresSecureStore() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export async function getStoredRefreshToken() {
  if (await canUseSecureStore()) {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  return memoryRefreshToken;
}

export async function setStoredRefreshToken(refreshToken: string) {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return;
  }

  if (requiresSecureStore()) {
    throw new Error('Secure token storage is unavailable on this device.');
  }

  memoryRefreshToken = refreshToken;
}

export async function clearStoredRefreshToken() {
  memoryRefreshToken = null;

  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}
