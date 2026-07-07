import { ApiRequestError, completeOnboardingPin } from '@/apis';
import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { PinInput } from '@/components/modules/auth/pin-input';
import { Text } from '@/components/ui/text';
import { useOnboarding } from '@/providers/onboarding-provider';
import { useSession } from '@/providers/session-provider';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return 'Unable to create your PIN. Please try again.';
}

export default function PinSetupScreen() {
  const router = useRouter();
  const { signInWithAuthResponse } = useSession();
  const { clearOnboarding, onboardingSessionToken } = useOnboarding();
  const [attemptKey, setAttemptKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!onboardingSessionToken) {
      router.replace('/(auth)/create-account/phone');
    }
  }, [onboardingSessionToken, router]);

  const handleComplete = async (pin: string) => {
    if (!onboardingSessionToken || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const authResponse = await completeOnboardingPin({ onboardingSessionToken, pin });
      await signInWithAuthResponse(authResponse);
      clearOnboarding();
      router.replace('/(app)/(tabs)');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setAttemptKey((current) => current + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="Create a PIN"
        subtitle="You'll use this PIN to unlock Tash and authorize transactions."
        showContinue={false}
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
          {isSubmitting ? (
            <Text
              font={{ family: 'SourceSans3', weight: 'Medium' }}
              style={{ color: '#A94E2C', fontSize: 14, lineHeight: 20, textAlign: 'center' }}
            >
              Creating PIN...
            </Text>
          ) : null}
          <PinInput key={attemptKey} onComplete={handleComplete} />
        </View>
      </AuthScreenLayout>
    </>
  );
}
