import { ApiRequestError, sendSignupEmailVerification } from '@/apis';
import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { AuthTextInput } from '@/components/modules/auth/auth-text-input';
import { Text } from '@/components/ui/text';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return 'Unable to send the verification code. Please try again.';
}

export default function EmailScreen() {
  const router = useRouter();
  const { setContact } = useOnboarding();

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const emailIsValid = normalizedEmail.includes('@') && normalizedEmail.includes('.');

  const handleContinue = async () => {
    if (!emailIsValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await sendSignupEmailVerification({ email: normalizedEmail });

      setContact({
        method: 'email',
        email: normalizedEmail,
      });

      router.push({
        pathname: '/(auth)/create-account/verify-email',
        params: {
          method: 'email',
          email: normalizedEmail,
        },
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
        heading="What's your email?"
        subtitle="We'll use this to keep your account secure."
        continueLabel={isSubmitting ? 'Sending code...' : 'Continue'}
        onContinue={handleContinue}
        continueDisabled={!emailIsValid || isSubmitting}>
        <View style={{ gap: 16 }}>
          <AuthTextInput
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrorMessage(null);
            }}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isSubmitting}
          />

          <Pressable
            disabled={isSubmitting}
            onPress={() => router.replace('/(auth)/create-account/phone')}
            style={{
              alignItems: 'center',
              opacity: isSubmitting ? 0.5 : 1,
            }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{
                fontSize: 15,
                color: '#C75A3A',
                textDecorationLine: 'underline',
              }}>
              Use phone number instead
            </Text>
          </Pressable>
        </View>

        {errorMessage ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'Medium' }}
            style={{
              color: '#C75A3A',
              fontSize: 14,
              lineHeight: 20,
              marginTop: 12,
            }}>
            {errorMessage}
          </Text>
        ) : null}
      </AuthScreenLayout>
    </>
  );
}
