import { ApiRequestError, updateTransactionPin } from '@/apis';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#FAFAF1';
const INK = '#151713';
const MUTED = '#6F746A';
const ORANGE = '#FF6A12';
const LINE = '#DFE1D4';
const DANGER = '#B42318';

function PinField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={(next) => onChangeText(next.replace(/\D/g, '').slice(0, 4))}
      keyboardType="number-pad"
      secureTextEntry
      maxLength={4}
      placeholder={placeholder}
      placeholderTextColor="#A8A29A"
      style={{
        height: 58,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: LINE,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        color: INK,
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 6,
      }}
    />
  );
}

export default function TransactionPinSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentPin, setCurrentPin] = React.useState('');
  const [newPin, setNewPin] = React.useState('');
  const [confirmPin, setConfirmPin] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const canSave =
    currentPin.length === 4 && newPin.length === 4 && confirmPin.length === 4 && !isSaving;

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMessage('New PIN entries do not match.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateTransactionPin({ currentPin, newPin });
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Unable to update transaction PIN.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top + 14 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingHorizontal: 24 }}>
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
            style={{ fontSize: 28, color: INK }}>
            Transaction PIN
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, fontSize: 15, color: MUTED }}>
            Update the 4-digit PIN used for transfers and funding.
          </Text>
        </View>

        <View style={{ gap: 14, marginTop: 28 }}>
          <PinField value={currentPin} onChangeText={setCurrentPin} placeholder="Current PIN" />
          <PinField value={newPin} onChangeText={setNewPin} placeholder="New PIN" />
          <PinField value={confirmPin} onChangeText={setConfirmPin} placeholder="Confirm new PIN" />
        </View>

        {errorMessage ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 16, color: DANGER, fontSize: 14 }}>
            {errorMessage}
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
              Update PIN
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
