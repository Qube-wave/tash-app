import {
  ApiRequestError,
  completeCurrentUserPhoneVerification,
  sendCurrentUserPhoneVerification,
} from '@/apis';
import { OtpInput } from '@/components/modules/auth/otp-input';
import { Text } from '@/components/ui/text';
import { useSession } from '@/providers/session-provider';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Phone } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#FAFAF1';
const INK = '#151713';
const MUTED = '#6F746A';
const ORANGE = '#FF6A12';
const BLACK = '#050505';
const LINE = '#DFE1D4';
const DANGER = '#B42318';
const SUCCESS = '#138A51';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeNigerianPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('234')) {
    return '+' + digits;
  }

  if (digits.startsWith('0')) {
    return '+234' + digits.slice(1);
  }

  return digits ? '+234' + digits : '';
}

function getSendErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    if (
      error.status === 409 ||
      [
        'PHONE_ALREADY_EXISTS',
        'PHONE_ALREADY_USED',
        'PHONE_IN_USE',
        'PHONE_ALREADY_IN_USE',
      ].includes(error.code)
    ) {
      return 'Phone is already in use.';
    }

    return error.message;
  }

  return 'Unable to send the verification code. Please try again.';
}

function getOtpErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    if (
      [
        'INVALID_OTP',
        'INVALID_TOKEN',
        'OTP_EXPIRED',
        'TOKEN_EXPIRED',
        'OTP_ALREADY_USED',
        'TOKEN_ALREADY_USED',
        'VERIFICATION_FAILED',
      ].includes(error.code)
    ) {
      return 'Invalid or expired OTP. Please try again.';
    }

    return error.message;
  }

  return 'Unable to verify this code. Please try again.';
}

export default function PhoneSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updateUser } = useSession();
  const params = useLocalSearchParams<{ next?: string }>();
  const nextRoute = getParam(params.next);
  const [phoneNumber, setPhoneNumber] = React.useState(user?.phoneNumber ?? '');
  const [pendingPhoneNumber, setPendingPhoneNumber] = React.useState<string | null>(null);
  const [attemptKey, setAttemptKey] = React.useState(0);
  const [isSending, setIsSending] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const normalizedPhoneNumber = normalizeNigerianPhoneNumber(phoneNumber);
  const phoneIsValid = normalizedPhoneNumber.length >= 14;
  const canSend = phoneIsValid && !isSending && !isVerifying;
  const canResend = Boolean(pendingPhoneNumber) && !isSending && !isVerifying;

  const continueAfterSuccess = () => {
    if (nextRoute) {
      router.replace(nextRoute as never);
      return;
    }

    router.replace('/settings/account-details' as never);
  };

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await sendCurrentUserPhoneVerification({ phoneNumber: normalizedPhoneNumber });
      setPendingPhoneNumber(normalizedPhoneNumber);
      setAttemptKey((current) => current + 1);
      setStatusMessage('A verification code has been sent.');
    } catch (error) {
      setErrorMessage(getSendErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !pendingPhoneNumber) {
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await sendCurrentUserPhoneVerification({ phoneNumber: pendingPhoneNumber });
      setAttemptKey((current) => current + 1);
      setStatusMessage('A new code has been sent.');
    } catch (error) {
      setErrorMessage(getSendErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  };

  const handleComplete = async (token: string) => {
    if (!pendingPhoneNumber || isVerifying) {
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const updatedUser = await completeCurrentUserPhoneVerification({
        phoneNumber: pendingPhoneNumber,
        token,
      });
      updateUser(updatedUser);
      continueAfterSuccess();
    } catch (error) {
      setErrorMessage(getOtpErrorMessage(error));
      setAttemptKey((current) => current + 1);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAwareScrollView
        bottomOffset={28}
        extraKeyboardSpace={24}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 14,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 120,
        }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: LINE,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ArrowLeft color={INK} size={21} />
        </Pressable>

        <View style={{ marginTop: 28 }}>
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: LINE,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}>
            <Phone color={ORANGE} size={27} />
          </View>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: INK, fontSize: 28 }}>
            {user?.phoneNumber ? 'Update phone' : 'Add phone'}
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, color: MUTED, fontSize: 15, lineHeight: 21 }}>
            Verify a phone number before setting up payment methods that require provider contact
            details.
          </Text>
        </View>

        <View style={{ marginTop: 28 }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ marginBottom: 8, color: INK, fontSize: 14 }}>
            Phone number
          </Text>
          <TextInput
            value={phoneNumber}
            onChangeText={(value) => {
              setPhoneNumber(value.trim());
              setPendingPhoneNumber(null);
              setErrorMessage(null);
              setStatusMessage(null);
            }}
            editable={!isSending && !isVerifying}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="0801 234 5678"
            placeholderTextColor="#A8A29A"
            style={{
              height: 56,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 16,
              color: INK,
              fontSize: 17,
              fontWeight: '700',
            }}
          />
        </View>

        <Pressable
          disabled={!canSend}
          onPress={handleSend}
          style={{
            marginTop: 18,
            height: 52,
            borderRadius: 26,
            backgroundColor: canSend ? BLACK : '#E5E7DA',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {isSending && !pendingPhoneNumber ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: canSend ? '#FFFFFF' : MUTED, fontSize: 15 }}>
              Send code
            </Text>
          )}
        </Pressable>

        {pendingPhoneNumber ? (
          <View style={{ marginTop: 28, alignItems: 'center' }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: INK, fontSize: 17 }}>
              Enter verification code
            </Text>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ marginTop: 4, marginBottom: 18, color: MUTED, fontSize: 14 }}>
              We sent a 6-digit code to {pendingPhoneNumber}.
            </Text>
            <OtpInput key={attemptKey} onComplete={handleComplete} />
            <Pressable
              disabled={!canResend}
              onPress={handleResend}
              style={{ marginTop: 18, opacity: canResend ? 1 : 0.55 }}>
              <Text
                font={{ family: 'SourceSans3', weight: 'Bold' }}
                style={{ color: ORANGE, fontSize: 15, textDecorationLine: 'underline' }}>
                {isSending ? 'Sending code...' : 'Resend code'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {isVerifying ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 16, color: ORANGE, fontSize: 14, textAlign: 'center' }}>
            Verifying code...
          </Text>
        ) : null}

        {statusMessage ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 16, color: SUCCESS, fontSize: 14, textAlign: 'center' }}>
            {statusMessage}
          </Text>
        ) : null}

        {errorMessage ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 16, color: DANGER, fontSize: 14, textAlign: 'center' }}>
            {errorMessage}
          </Text>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
}
