import { ApiRequestError } from '@/apis';
import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { PinInput } from '@/components/modules/auth/pin-input';
import { Text } from '@/components/ui/text';
import { useSession } from '@/providers/session-provider';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

function getUnlockErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    if (
      ['INVALID_REFRESH_TOKEN', 'REFRESH_TOKEN_INVALID', 'REFRESH_TOKEN_EXPIRED'].includes(
        error.code,
      )
    ) {
      return 'Your session expired. Please sign in again.';
    }

    return error.message;
  }

  return 'Unable to unlock your session. Please try again.';
}

export default function UnlockScreen() {
  const router = useRouter();
  const { logout, unlockWithPin } = useSession();
  const [attemptKey, setAttemptKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleComplete = async (pin: string) => {
    if (isUnlocking) {
      return;
    }

    setIsUnlocking(true);
    setErrorMessage(null);

    try {
      await unlockWithPin(pin);
      router.replace('/(app)/(tabs)');
    } catch (error) {
      setErrorMessage(getUnlockErrorMessage(error));
      setAttemptKey((current) => current + 1);
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="Unlock Tash"
        subtitle="Enter your transaction PIN to continue."
        showContinue={false}
        onBack={handleLogout}
      >
        <View style={{ flex: 1 }}>
          {errorMessage ? (
            <Text
              font={{ family: 'SourceSans3', weight: 'Medium' }}
              style={{ color: '#C75A3A', fontSize: 14, lineHeight: 20, textAlign: 'center' }}
            >
              {errorMessage}
            </Text>
          ) : null}
          {isUnlocking ? (
            <Text
              font={{ family: 'SourceSans3', weight: 'Medium' }}
              style={{ color: '#A94E2C', fontSize: 14, lineHeight: 20, textAlign: 'center' }}
            >
              Checking PIN...
            </Text>
          ) : null}
          <PinInput key={attemptKey} onComplete={handleComplete} />
        </View>
      </AuthScreenLayout>
    </>
  );
}
