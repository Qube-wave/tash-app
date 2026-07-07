<<<<<<< HEAD
import { ApiRequestError, sendSignupPhoneVerification } from '@/apis';
import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { PhoneInput } from '@/components/modules/auth/phone-input';
import { Text } from '@/components/ui/text';
import { useOnboarding } from '@/providers/onboarding-provider';
=======
import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { PhoneInput } from '@/components/modules/auth/phone-input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useColors } from '@/lib/use-colors';
>>>>>>> 4edcff91cf02b0ccc5857354ab155381f28cc28e
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return 'Unable to send the verification code. Please try again.';
}

function normalizeNigerianPhoneNumber(value: string) {
  const digits = value.replace(/[^0-9]/g, '');

  if (digits.startsWith('234')) {
    return `+${digits}`;
  }

  if (digits.startsWith('0')) {
    return `+234${digits.slice(1)}`;
  }

  return `+234${digits}`;
}

export default function PhoneScreen() {
  const router = useRouter();
<<<<<<< HEAD
  const { setContact } = useOnboarding();
=======
  const colors = useColors();
>>>>>>> 4edcff91cf02b0ccc5857354ab155381f28cc28e
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedPhoneNumber = normalizeNigerianPhoneNumber(phoneNumber);
  const phoneIsValid = normalizedPhoneNumber.length >= 14;

  const handleContinue = async () => {
    if (!phoneIsValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await sendSignupPhoneVerification({ phoneNumber: normalizedPhoneNumber });
      setContact({ method: 'phone', phoneNumber: normalizedPhoneNumber });
      router.push({
        pathname: '/(auth)/create-account/verify-email',
        params: { method: 'phone', phoneNumber: normalizedPhoneNumber },
      });
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
        heading="What's your number?"
<<<<<<< HEAD
        subtitle={"We'll send you a verification code\nto create your account at Tash."}
        continueLabel={isSubmitting ? 'Sending code...' : 'Continue'}
        onContinue={handleContinue}
        continueDisabled={!phoneIsValid || isSubmitting}
      >
        <View style={{ gap: 16 }}>
          <PhoneInput
            phoneNumber={phoneNumber}
            onChangePhoneNumber={(value) => {
              setPhoneNumber(value);
              setErrorMessage(null);
            }}
          />
          <Pressable
            disabled={isSubmitting}
            onPress={() => router.replace('/(auth)/create-account/email')}
            style={{ alignItems: 'center', opacity: isSubmitting ? 0.5 : 1 }}
          >
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ fontSize: 15, color: '#C75A3A', textDecorationLine: 'underline' }}
            >
              Use email instead
            </Text>
          </Pressable>
        </View>
        {errorMessage ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'Medium' }}
            style={{ color: '#C75A3A', fontSize: 14, lineHeight: 20, marginTop: 12 }}
          >
            {errorMessage}
          </Text>
        ) : null}
=======
        subtitle={"We'll send you a verification code\nto get your account set up."}
        onContinue={() => router.push('/(auth)/create-account/email')}
        continueDisabled={phoneNumber.length < 10}
        footer={
          <Button variant="link" onPress={() => router.push('/(auth)/login/email')}>
            <Text font={{ family: 'SourceSans3' }} style={{ fontSize: 14, color: colors.subtitle }}>
              Already have an account?{' '}
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ color: colors.accent }}>
                Login
              </Text>
            </Text>
          </Button>
        }>
        <PhoneInput phoneNumber={phoneNumber} onChangePhoneNumber={setPhoneNumber} />
>>>>>>> 4edcff91cf02b0ccc5857354ab155381f28cc28e
      </AuthScreenLayout>
    </>
  );
}
