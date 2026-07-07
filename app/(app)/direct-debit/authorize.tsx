import { ApiRequestError, authorizeDirectDebitMandate } from '@/apis';
import { Text } from '@/components/ui/text';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
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

export default function AuthorizeDirectDebitMandateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { uuid } = useLocalSearchParams<{ uuid?: string }>();
  const [authorizationReference, setAuthorizationReference] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const canSubmit = Boolean(uuid) && authorizationReference.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit || !uuid) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await authorizeDirectDebitMandate(uuid, {
        authorizationReference: authorizationReference.trim(),
      });
      router.replace('/(app)/(tabs)/cards' as never);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Unable to authorize mandate.'
      );
    } finally {
      setIsSubmitting(false);
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
            <ShieldCheck color={ORANGE} size={27} />
          </View>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: INK, fontSize: 28 }}>
            Authorize mandate
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, color: MUTED, fontSize: 15 }}>
            Enter the provider authorization reference to activate this mandate.
          </Text>
        </View>

        <TextInput
          value={authorizationReference}
          onChangeText={(value) => {
            setAuthorizationReference(value);
            setErrorMessage(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="provider-authorization-reference"
          placeholderTextColor="#A8A29A"
          style={{
            marginTop: 28,
            height: 58,
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
              Authorize
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
