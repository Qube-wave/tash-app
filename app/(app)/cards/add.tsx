import {
  ApiRequestError,
  createCardRegistrationSession,
  submitCardDetails,
  type CardRegistrationSession,
} from '@/apis';
import { Text } from '@/components/ui/text';
import { useSession } from '@/providers/session-provider';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, CreditCard } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, TextInput, type TextInputProps, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#FAFAF1';
const INK = '#151713';
const MUTED = '#6F746A';
const ORANGE = '#FF6A12';
const BLACK = '#050505';
const LINE = '#DFE1D4';
const DANGER = '#B42318';

function isOtpRequired(session: CardRegistrationSession) {
  return session.status === 'pending' && session.metadata.nextAction === 'submit_otp';
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: TextInputProps['keyboardType'];
  secureTextEntry?: boolean;
  maxLength?: number;
}) {
  return (
    <View>
      <Text
        font={{ family: 'SourceSans3', weight: 'Bold' }}
        style={{ marginBottom: 8, color: INK, fontSize: 14 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        placeholder={placeholder}
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
  );
}

export default function AddCardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useSession();
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiryMonth, setExpiryMonth] = React.useState('');
  const [expiryYear, setExpiryYear] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [cardPin, setCardPin] = React.useState('');
  const [cardholderName, setCardholderName] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const sanitizedCardNumber = cardNumber.replace(/\D/g, '');
  const hasEmail = Boolean(user?.email);
  const hasPhoneNumber = Boolean(user?.phoneNumber);
  const missingContactDetails = [
    !hasEmail ? 'email' : null,
    !hasPhoneNumber ? 'phone number' : null,
  ].filter(Boolean) as string[];
  const canStartSetup = missingContactDetails.length === 0;
  const missingContactLabel = missingContactDetails.join(' and ');
  const missingEmail = !hasEmail;
  const canSubmit =
    canStartSetup &&
    sanitizedCardNumber.length >= 12 &&
    expiryMonth.length === 2 &&
    expiryYear.length === 4 &&
    cvv.length >= 3 &&
    !isSubmitting;

  const clearSensitiveFields = () => {
    setCardNumber('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    setCardPin('');
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const session = await createCardRegistrationSession({
        currency: 'NGN',
        email: user?.email ?? undefined,
      });
      const result = await submitCardDetails(session.reference, {
        cardNumber: sanitizedCardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardPin: cardPin || undefined,
        cardholderName: cardholderName.trim() || undefined,
      });

      clearSensitiveFields();

      if (isOtpRequired(result)) {
        router.replace({
          pathname: '/cards/otp' as never,
          params: { reference: result.reference },
        });
        return;
      }

      router.back();
    } catch (error) {
      clearSensitiveFields();
      setErrorMessage(error instanceof ApiRequestError ? error.message : 'Unable to add card.');
    } finally {
      setIsSubmitting(false);
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
          paddingBottom: insets.bottom + 220,
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
            <CreditCard color={ORANGE} size={27} />
          </View>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: INK, fontSize: 28 }}>
            Add card
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, color: MUTED, fontSize: 15 }}>
            Card details are submitted once and cleared from the form after submission.
          </Text>
        </View>

        {!canStartSetup ? (
          <View
            style={{
              marginTop: 28,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#FED7AA',
              backgroundColor: '#FFF7ED',
              padding: 16,
            }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: INK, fontSize: 16 }}>
              Contact detail required
            </Text>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ marginTop: 6, color: MUTED, fontSize: 14, lineHeight: 20 }}>
              Add your {missingContactLabel} to your profile before adding a card.
            </Text>
            <Pressable
              onPress={() =>
                missingEmail
                  ? router.push({
                      pathname: '/settings/email' as never,
                      params: { next: '/cards/add' },
                    })
                  : router.push('/settings/account-details' as never)
              }
              style={{
                alignSelf: 'flex-start',
                marginTop: 14,
                height: 42,
                borderRadius: 21,
                backgroundColor: BLACK,
                paddingHorizontal: 18,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                font={{ family: 'SourceSans3', weight: 'Bold' }}
                style={{ color: '#FFFFFF', fontSize: 14 }}>
                {missingEmail ? 'Add email' : 'View profile'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ gap: 16, marginTop: 28 }}>
              <Field
                label="Card number"
                value={cardNumber}
                onChangeText={(value) => setCardNumber(value.replace(/\D/g, '').slice(0, 19))}
                placeholder="4111111111111111"
                keyboardType="number-pad"
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Month"
                    value={expiryMonth}
                    onChangeText={(value) => setExpiryMonth(value.replace(/\D/g, '').slice(0, 2))}
                    placeholder="12"
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Year"
                    value={expiryYear}
                    onChangeText={(value) => setExpiryYear(value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="2030"
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="CVV"
                    value={cvv}
                    onChangeText={(value) => setCvv(value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={4}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Card PIN"
                    value={cardPin}
                    onChangeText={(value) => setCardPin(value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Optional"
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={4}
                  />
                </View>
              </View>
              <Field
                label="Cardholder name"
                value={cardholderName}
                onChangeText={setCardholderName}
                placeholder="Optional name"
              />
            </View>

            {errorMessage ? (
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ marginTop: 16, color: DANGER, fontSize: 14 }}>
                {errorMessage}
              </Text>
            ) : null}

            <Pressable
              disabled={!canSubmit}
              onPress={handleSubmit}
              style={{
                marginTop: 28,
                height: 56,
                borderRadius: 28,
                backgroundColor: canSubmit ? ORANGE : '#E5E7DA',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {isSubmitting ? (
                <ActivityIndicator color={INK} />
              ) : (
                <Text
                  font={{ family: 'SourceSans3', weight: 'Bold' }}
                  style={{ color: INK, fontSize: 16 }}>
                  Submit card
                </Text>
              )}
            </Pressable>
          </>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}
