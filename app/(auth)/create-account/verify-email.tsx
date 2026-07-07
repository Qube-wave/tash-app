import {
  ApiRequestError,
  completeSignupEmailVerification,
  completeSignupPhoneVerification,
  sendSignupEmailVerification,
  sendSignupPhoneVerification,
  type OnboardingStep,
} from '@/apis';
import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { OtpInput } from '@/components/modules/auth/otp-input';
import { Text } from '@/components/ui/text';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

type SignupMethod = 'email' | 'phone';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return 'Unable to verify this code. Please try again.';
}

function routeForStep(step: OnboardingStep) {
  if (step === 'claim_tag') {
    return '/(auth)/create-account/bvn' as const;
  }

  if (step === 'pin') {
    return '/(auth)/create-account/pin-setup' as const;
  }

  return '/(auth)/create-account/personal-info' as const;
}

export default function VerifyEmailScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    method?: SignupMethod;
    email?: string;
    phoneNumber?: string;
  }>();

  const { contact, setContact, setVerifiedSession } = useOnboarding();

  const method: SignupMethod = params.method === 'phone' ? 'phone' : (contact?.method ?? 'email');

  const identifier = useMemo(() => {
    const routeValue = method === 'phone' ? getParam(params.phoneNumber) : getParam(params.email);

    const contactValue =
      contact?.method === 'phone'
        ? contact.phoneNumber
        : contact?.method === 'email'
          ? contact.email
          : '';

    const value = routeValue ?? contactValue;

    return method === 'phone' ? (value?.trim() ?? '') : (value?.trim().toLowerCase() ?? '');
  }, [contact, method, params.email, params.phoneNumber]);

  const targetLabel = method === 'phone' ? 'phone number' : 'email address';

  const [attemptKey, setAttemptKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!identifier) {
      router.replace(
        method === 'phone' ? '/(auth)/create-account/phone' : '/(auth)/create-account/email'
      );
    }
  }, [identifier, method, router]);

  const onboardingContact =
    method === 'phone'
      ? ({ method, phoneNumber: identifier } as const)
      : ({ method, email: identifier } as const);

  const handleComplete = async (token: string) => {
    if (!identifier || isVerifying) {
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response =
        method === 'phone'
          ? await completeSignupPhoneVerification({
              phoneNumber: identifier,
              token,
            })
          : await completeSignupEmailVerification({
              email: identifier,
              token,
            });

      setVerifiedSession({
        contact: onboardingContact,
        currentStep: response.currentStep,
        onboardingSessionToken: response.onboardingSessionToken,
      });

      router.replace(routeForStep(response.currentStep));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setAttemptKey((current) => current + 1);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!identifier || isResending || isVerifying) {
      return;
    }

    setIsResending(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      if (method === 'phone') {
        await sendSignupPhoneVerification({
          phoneNumber: identifier,
        });
      } else {
        await sendSignupEmailVerification({
          email: identifier,
        });
      }

      setContact(onboardingContact);
      setStatusMessage('A new code has been sent.');
      setAttemptKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <AuthScreenLayout
        heading={method === 'phone' ? 'Verify your phone' : 'Verify your email'}
        subtitle={
          identifier
            ? `Enter the 6-digit code we sent to ${identifier}.`
            : `Enter the 6-digit code we sent to your ${targetLabel}.`
        }
        showContinue={false}>
        <View style={{ gap: 24 }}>
          {errorMessage ? (
            <Text
              font={{ family: 'SourceSans3', weight: 'Medium' }}
              style={{
                color: '#C75A3A',
                fontSize: 14,
                lineHeight: 20,
                textAlign: 'center',
              }}>
              {errorMessage}
            </Text>
          ) : null}

          {statusMessage ? (
            <Text
              font={{ family: 'SourceSans3', weight: 'Medium' }}
              style={{
                color: '#A94E2C',
                fontSize: 14,
                lineHeight: 20,
                textAlign: 'center',
              }}>
              {statusMessage}
            </Text>
          ) : null}

          {isVerifying ? (
            <Text
              font={{ family: 'SourceSans3', weight: 'Medium' }}
              style={{
                color: '#A94E2C',
                fontSize: 14,
                lineHeight: 20,
                textAlign: 'center',
              }}>
              Verifying code...
            </Text>
          ) : null}

          <OtpInput key={attemptKey} onComplete={handleComplete} />

          <View style={{ gap: 14 }}>
            <Pressable
              disabled={isResending || isVerifying}
              onPress={handleResend}
              style={{
                alignItems: 'center',
                opacity: isResending || isVerifying ? 0.5 : 1,
              }}>
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{
                  fontSize: 15,
                  color: '#C75A3A',
                  textDecorationLine: 'underline',
                }}>
                {isResending ? 'Sending code...' : 'Resend code'}
              </Text>
            </Pressable>

            <Pressable
              disabled={isResending || isVerifying}
              onPress={() =>
                router.replace(
                  method === 'phone'
                    ? '/(auth)/create-account/email'
                    : '/(auth)/create-account/phone'
                )
              }
              style={{
                alignItems: 'center',
                opacity: isResending || isVerifying ? 0.5 : 1,
              }}>
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{
                  fontSize: 15,
                  color: '#A94E2C',
                  textDecorationLine: 'underline',
                }}>
                {method === 'phone' ? 'Use email instead' : 'Use phone number instead'}
              </Text>
            </Pressable>
          </View>
        </View>
      </AuthScreenLayout>
    </>
  );
}
