import { ApiRequestError, claimPaymentTag } from '@/apis';
import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { AuthTextInput } from '@/components/modules/auth/auth-text-input';
import { Text } from '@/components/ui/text';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return 'Unable to claim this payment tag. Please try again.';
}

function normalizePaymentTag(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24);
}

export default function PaymentTagScreen() {
  const router = useRouter();
  const { onboardingSessionToken, setStep } = useOnboarding();
  const [paymentTag, setPaymentTag] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!onboardingSessionToken) {
      router.replace('/(auth)/create-account/phone');
    }
  }, [onboardingSessionToken, router]);

  const tagIsValid = paymentTag.length >= 3;

  const handleContinue = async () => {
    if (!onboardingSessionToken || !tagIsValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await claimPaymentTag({ onboardingSessionToken, paymentTag });
      setStep(response.currentStep, response.user);
      router.push('/(auth)/create-account/pin-setup');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="Claim your tag"
        subtitle="Choose your public payment tag for receiving money."
        continueLabel={isSubmitting ? 'Claiming...' : 'Continue'}
        onContinue={handleContinue}
        continueDisabled={!tagIsValid || isSubmitting}
      >
        <AuthTextInput
          value={paymentTag}
          onChangeText={(value) => {
            setPaymentTag(normalizePaymentTag(value));
            setErrorMessage(null);
          }}
          placeholder="tashuser"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
        />
        {errorMessage ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'Medium' }}
            style={{ color: '#C75A3A', fontSize: 14, lineHeight: 20, marginTop: 12 }}
          >
            {errorMessage}
          </Text>
        ) : null}
      </AuthScreenLayout>
    </>
  );
}
