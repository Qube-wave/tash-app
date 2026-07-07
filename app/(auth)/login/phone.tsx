import { ApiRequestError, sendLoginPhoneVerification } from '@/apis';
import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { PhoneInput } from '@/components/modules/auth/phone-input';
import { Text } from '@/components/ui/text';
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

export default function LoginPhoneScreen() {
  const router = useRouter();
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
      await sendLoginPhoneVerification({ phoneNumber: normalizedPhoneNumber });
      router.push({
        pathname: '/(auth)/login/verify',
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
        heading="Welcome back"
        subtitle="Enter your phone number to sign in."
        continueLabel={isSubmitting ? 'Sending code...' : 'Sign in'}
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
            onPress={() => router.replace('/(auth)/login/email')}
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
      </AuthScreenLayout>
    </>
  );
}
