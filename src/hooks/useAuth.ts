import { useState, useEffect, useCallback } from 'react';
import { getAuthState, saveAuthState } from '@/lib/db';
import type { AuthState } from '@/types/task';

const DEFAULT_AUTH: AuthState = {
  isAuthenticated: false,
  passcode: null,
  biometricEnabled: false,
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const state = await getAuthState();
      setAuthState(state || DEFAULT_AUTH);
      setIsLocked(!!state?.passcode);
    } catch (error) {
      console.error('Failed to load auth state:', error);
      setAuthState(DEFAULT_AUTH);
    } finally {
      setIsLoading(false);
    }
  };

  const setupPasscode = useCallback(async (passcode: string) => {
    const newState: AuthState = {
      isAuthenticated: true,
      passcode,
      biometricEnabled: false,
    };
    await saveAuthState(newState);
    setAuthState(newState);
    setIsLocked(false);
  }, []);

  const verifyPasscode = useCallback(async (passcode: string): Promise<boolean> => {
    if (!authState?.passcode) return true;
    const isValid = authState.passcode === passcode;
    if (isValid) {
      setIsLocked(false);
    }
    return isValid;
  }, [authState]);

  const lock = useCallback(() => {
    if (authState?.passcode) {
      setIsLocked(true);
    }
  }, [authState]);

  const removePasscode = useCallback(async () => {
    const newState: AuthState = {
      ...DEFAULT_AUTH,
      isAuthenticated: true,
    };
    await saveAuthState(newState);
    setAuthState(newState);
    setIsLocked(false);
  }, []);

  const hasPasscode = !!authState?.passcode;
  const isAuthenticated = !hasPasscode || !isLocked;

  return {
    isLoading,
    isAuthenticated,
    hasPasscode,
    isLocked,
    setupPasscode,
    verifyPasscode,
    lock,
    removePasscode,
  };
}
