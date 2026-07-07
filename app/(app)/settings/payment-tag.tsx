import { ApiRequestError, changePaymentTag, getCurrentUser } from '@/apis';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, AtSign } from 'lucide-react-native';
import * as React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#FAFAF1';
const INK = '#151713';
const MUTED = '#6F746A';
const ORANGE = '#FF6A12';
const LINE = '#DFE1D4';
const DANGER = '#B42318';

function cleanTag(value: string) {
  return value.trim().replace(/^@+/, '').toLowerCase();
}

export default function PaymentTagSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [paymentTag, setPaymentTag] = React.useState('');
  const [initialTag, setInitialTag] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const user = await getCurrentUser({ signal: controller.signal });
        const tag = user.paymentTag ?? '';
        setPaymentTag(tag);
        setInitialTag(tag);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof ApiRequestError ? error.message : 'Unable to load payment tag.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => controller.abort();
  }, []);

  const normalizedTag = cleanTag(paymentTag);
  const canSave = normalizedTag.length >= 3 && normalizedTag !== initialTag && !isSaving;

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      await changePaymentTag({ paymentTag: normalizedTag });
      setInitialTag(normalizedTag);
      setPaymentTag(normalizedTag);
      setMessage('Payment tag updated.');
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Unable to update payment tag.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
      style={{ flex: 1, backgroundColor: BG }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 14,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 180,
        }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
          {isLoading ? <ActivityIndicator color={ORANGE} /> : null}
        </View>

        <View style={{ marginTop: 28 }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ fontSize: 28, color: INK }}>
            Payment tag
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, fontSize: 15, color: MUTED }}>
            This is your public payment identifier.
          </Text>
        </View>

        <View style={{ marginTop: 28 }}>
          <View
            style={{
              height: 58,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: '#FFFFFF',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
            }}>
            <AtSign color={MUTED} size={19} />
            <TextInput
              value={paymentTag}
              onChangeText={(value) => {
                setPaymentTag(value);
                setMessage(null);
                setErrorMessage(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading && !isSaving}
              placeholder="tashuser"
              placeholderTextColor="#A8A29A"
              style={{ flex: 1, marginLeft: 8, color: INK, fontSize: 18, fontWeight: '700' }}
            />
          </View>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 8, fontSize: 13, color: MUTED }}>
            Use letters, numbers, and no spaces. Do not include @.
          </Text>
        </View>

        {errorMessage ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 16, color: DANGER, fontSize: 14 }}>
            {errorMessage}
          </Text>
        ) : null}
        {message ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 16, color: ORANGE, fontSize: 14 }}>
            {message}
          </Text>
        ) : null}

        <Pressable
          disabled={!canSave}
          onPress={handleSave}
          style={{
            marginTop: 28,
            height: 56,
            borderRadius: 28,
            backgroundColor: canSave ? ORANGE : '#E5E7DA',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {isSaving ? (
            <ActivityIndicator color={INK} />
          ) : (
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: INK, fontSize: 16 }}>
              Save tag
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
