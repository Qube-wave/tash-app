import {
  ApiRequestError,
  apiClient,
  logoutAllDevices,
  logoutCurrentDevice,
  refreshSession,
  unlockSession,
  type AuthResponse,
  type PublicUserProfile,
} from '@/apis';
import {
  clearStoredRefreshToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
} from '@/lib/session-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type SessionStatus = 'bootstrapping' | 'signedOut' | 'locked' | 'authenticated';

type SessionContextValue = {
  status: SessionStatus;
  user: PublicUserProfile | null;
  accessToken: string | null;
  hasStoredRefreshToken: boolean;
  signInWithAuthResponse: (authResponse: AuthResponse) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);
let accessTokenSnapshot: string | null = null;

apiClient.setAccessTokenProvider(() => accessTokenSnapshot);

function setAccessTokenSnapshot(accessToken: string | null) {
  accessTokenSnapshot = accessToken;
}

function isRefreshTokenFailure(error: unknown) {
  return (
    error instanceof ApiRequestError &&
    ['INVALID_REFRESH_TOKEN', 'REFRESH_TOKEN_INVALID', 'REFRESH_TOKEN_EXPIRED'].includes(error.code)
  );
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('bootstrapping');
  const [user, setUser] = useState<PublicUserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const applyAuthResponse = useCallback(async (authResponse: AuthResponse) => {
    await setStoredRefreshToken(authResponse.refreshToken);
    setAccessTokenSnapshot(authResponse.accessToken);
    setAccessToken(authResponse.accessToken);
    setRefreshToken(authResponse.refreshToken);
    setUser(authResponse.user);
    setStatus('authenticated');
  }, []);

  const clearSession = useCallback(async () => {
    await clearStoredRefreshToken();
    setAccessTokenSnapshot(null);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setStatus('signedOut');
  }, []);

  const logout = useCallback(async () => {
    const token = refreshToken ?? (await getStoredRefreshToken());

    if (token && accessTokenSnapshot) {
      try {
        await logoutCurrentDevice({ refreshToken: token }, { accessToken: accessTokenSnapshot });
      } catch {
        // Local session cleanup should still happen if the network/logout request fails.
      }
    }

    await clearSession();
  }, [clearSession, refreshToken]);

  const logoutAll = useCallback(async () => {
    if (accessTokenSnapshot) {
      try {
        await logoutAllDevices({ accessToken: accessTokenSnapshot });
      } catch {
        // Local session cleanup should still happen if the network/logout request fails.
      }
    }

    await clearSession();
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const storedRefreshToken = await getStoredRefreshToken();

      if (!isMounted) {
        return;
      }

      setRefreshToken(storedRefreshToken);
      setStatus(storedRefreshToken ? 'locked' : 'signedOut');
    }

    bootstrap().catch(() => {
      if (isMounted) {
        setStatus('signedOut');
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const signInWithAuthResponse = useCallback(
    async (authResponse: AuthResponse) => {
      await applyAuthResponse(authResponse);
    },
    [applyAuthResponse]
  );

  const unlockWithPin = useCallback(
    async (pin: string) => {
      const token = refreshToken ?? (await getStoredRefreshToken());

      if (!token) {
        await clearSession();
        return;
      }

      try {
        const authResponse = await unlockSession({ refreshToken: token, pin });
        await applyAuthResponse(authResponse);
      } catch (error) {
        if (isRefreshTokenFailure(error)) {
          await clearSession();
        }

        throw error;
      }
    },
    [applyAuthResponse, clearSession, refreshToken]
  );

  const refreshAccessToken = useCallback(async () => {
    const token = refreshToken ?? (await getStoredRefreshToken());

    if (!token) {
      await clearSession();
      return null;
    }

    try {
      const authResponse = await refreshSession({ refreshToken: token });
      await applyAuthResponse(authResponse);
      return authResponse.accessToken;
    } catch (error) {
      await clearSession();
      throw error;
    }
  }, [applyAuthResponse, clearSession, refreshToken]);

  useEffect(() => {
    apiClient.setRefreshAccessTokenProvider(refreshAccessToken);

    return () => {
      apiClient.setRefreshAccessTokenProvider(null);
    };
  }, [refreshAccessToken]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user,
      accessToken,
      hasStoredRefreshToken: Boolean(refreshToken),
      signInWithAuthResponse,
      unlockWithPin,
      refreshAccessToken,
      logout,
      logoutAll,
    }),
    [
      accessToken,
      clearSession,
      logout,
      logoutAll,
      refreshAccessToken,
      refreshToken,
      signInWithAuthResponse,
      status,
      unlockWithPin,
      user,
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within SessionProvider.');
  }

  return context;
}
