import {
  ApiRequestError,
  completeLoginEmailVerification,
  completeLoginPhoneVerification,
  sendLoginEmailVerification,
  sendLoginPhoneVerification,
  sendSignupEmailVerification,
  sendSignupPhoneVerification,
} from '@/apis';
import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { OtpInput } from '@/components/modules/auth/otp-input';
import { Text } from '@/components/ui/text';
import { useSession } from '@/providers/session-provider';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

const PENDING_REGISTRATION_CODES = new Set([
  'PENDING_REGISTRATION',
  'USER_PENDING_REGISTRATION',
  'REGISTRATION_INCOMPLETE',
]);

type LoginMethod = 'email' | 'phone';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getErrorCode(error: unknown) {
  return error instanceof ApiRequestError ? error.code : null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return 'Unable to verify this code. Please try again.';
}

export default function LoginVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    method?: LoginMethod;
    email?: string;
    phoneNumber?: string;
  }>();
  const { signInWithAuthResponse } = useSession();
  const method: LoginMethod = params.method === 'phone' ? 'phone' : 'email';
  const identifier = useMemo(() => {
    const value = method === 'phone' ? getParam(params.phoneNumber) : getParam(params.email);
    return method === 'phone' ? value?.trim() ?? '' : value?.trim().toLowerCase() ?? '';
  }, [method, params.email, params.phoneNumber]);
  const [attemptKey, setAttemptKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!identifier) {
      router.replace(method === 'phone' ? '/(auth)/login/phone' : '/(auth)/login/email');
    }
  }, [identifier, method, router]);

  const continuePendingRegistration = async () => {
    if (method === 'phone') {
      await sendSignupPhoneVerification({ phoneNumber: identifier });
      router.replace({
        pathname: '/(auth)/create-account/verify-email',
        params: { method, phoneNumber: identifier },
      });
      return;
    }

    await sendSignupEmailVerification({ email: identifier });
    router.replace({
      pathname: '/(auth)/create-account/verify-email',
      params: { method, email: identifier },
    });
  };

  const handleComplete = async (token: string) => {
    if (!identifier || isVerifying) {
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const authResponse =
        method === 'phone'
          ? await completeLoginPhoneVerification({ phoneNumber: identifier, token })
          : await completeLoginEmailVerification({ email: identifier, token });

      if (authResponse.user.status !== 'active') {
        await continuePendingRegistration();
        return;
      }

      await signInWithAuthResponse(authResponse);
      router.replace('/(app)/(tabs)');
    } catch (error) {
      if (PENDING_REGISTRATION_CODES.has(getErrorCode(error) ?? '')) {
        try {
          await continuePendingRegistration();
          return;
        } catch (resumeError) {
          setErrorMessage(getErrorMessage(resumeError));
          return;
        }
      }

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
        await sendLoginPhoneVerification({ phoneNumber: identifier });
      } else {
        await sendLoginEmailVerification({ email: identifier });
      }

      setStatusMessage('A new code has been sent.');
      setAttemptKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  const switchTarget = method === 'phone' ? '/(auth)/login/email' : '/(auth)/login/phone';
  const switchLabel = method === 'phone' ? 'Use email instead' : 'Use phone number instead';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="Enter the code"
        subtitle={
          identifier
            ? `We sent a verification code to ${identifier}.`
            : `We sent a verification code to your ${method === 'phone' ? 'phone' : 'email address'}.`
        }
        showContinue={false}
      >
        <View style={{ gap: 24 }}>
          {errorMessage ? (
            <Text
              font={{ family: 'SourceSans3', weight: 'Medium' }}
              style={{ color: '#C75A3A', fontSize: 14, lineHeight: 20, textAlign: 'center' }}
            >
              {errorMessage}
            </Text>
          ) : null}
          {statusMessage ? (
            <Text
              font={{ family: 'SourceSans3', weight: 'Medium' }}
              style={{ color: '#A94E2C', fontSize: 14, lineHeight: 20, textAlign: 'center' }}
            >
              {statusMessage}
            </Text>
          ) : null}
          {isVerifying ? (
            <Text
              font={{ family: 'SourceSans3', weight: 'Medium' }}
              style={{ color: '#A94E2C', fontSize: 14, lineHeight: 20, textAlign: 'center' }}
            >
              Verifying code...
            </Text>
          ) : null}
          <OtpInput key={attemptKey} onComplete={handleComplete} />
          <View style={{ gap: 14 }}>
            <Pressable
              disabled={isResending || isVerifying}
              onPress={handleResend}
              style={{ alignItems: 'center', opacity: isResending || isVerifying ? 0.5 : 1 }}
            >
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ fontSize: 15, color: '#C75A3A', textDecorationLine: 'underline' }}
              >
                {isResending ? 'Sending code...' : 'Resend code'}
              </Text>
            </Pressable>
            <Pressable
              disabled={isResending || isVerifying}
              onPress={() => router.replace(switchTarget)}
              style={{ alignItems: 'center', opacity: isResending || isVerifying ? 0.5 : 1 }}
            >
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ fontSize: 15, color: '#A94E2C', textDecorationLine: 'underline' }}
              >
                {switchLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </AuthScreenLayout>
    </>
  );
}
