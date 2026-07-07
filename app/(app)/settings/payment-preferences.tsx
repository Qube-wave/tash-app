import { ApiRequestError, getPaymentSettings, updatePaymentSettings } from '@/apis';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, Landmark, SlidersHorizontal } from 'lucide-react-native';
import * as React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
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

type ToggleRowProps = {
  icon: React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  value: boolean;
  disabled: boolean;
  onValueChange: (value: boolean) => void;
};

function ToggleRow({
  icon: Icon,
  title,
  subtitle,
  value,
  disabled,
  onValueChange,
}: ToggleRowProps) {
  return (
    <View
      style={{
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: '#EFF0E6',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
        <Icon color={INK} size={19} />
      </View>
      <View style={{ flex: 1 }}>
        <Text font={{ family: 'SourceSans3', weight: 'Bold' }} style={{ fontSize: 15, color: INK }}>
          {title}
        </Text>
        <Text
          font={{ family: 'SourceSans3', weight: 'SemiBold' }}
          style={{ marginTop: 1, fontSize: 13, color: MUTED }}>
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: '#D8DACC', true: '#FFB07A' }}
        thumbColor={value ? ORANGE : '#FFFFFF'}
      />
    </View>
  );
}

export default function PaymentPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [allowCardPayments, setAllowCardPayments] = React.useState(true);
  const [allowDirectDebitPayments, setAllowDirectDebitPayments] = React.useState(true);
  const [singleTransactionLimit, setSingleTransactionLimit] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadSettings() {
      try {
        const settings = await getPaymentSettings({ signal: controller.signal });
        setAllowCardPayments(settings.allowCardPayments);
        setAllowDirectDebitPayments(settings.allowDirectDebitPayments);
        setSingleTransactionLimit(String(settings.singleTransactionLimit ?? ''));
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof ApiRequestError ? error.message : 'Unable to load payment settings.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => controller.abort();
  }, []);

  const parsedLimit = Number(singleTransactionLimit);
  const canSave = Number.isFinite(parsedLimit) && parsedLimit > 0 && !isLoading && !isSaving;

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updatePaymentSettings({
        allowCardPayments,
        allowDirectDebitPayments,
        singleTransactionLimit: parsedLimit,
      });
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Unable to update payment settings.'
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
            Payment settings
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, fontSize: 15, color: MUTED }}>
            Control payment methods and your single transaction limit.
          </Text>
        </View>

        <View
          style={{
            marginTop: 28,
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: LINE,
            overflow: 'hidden',
          }}>
          <ToggleRow
            icon={CreditCard}
            title="Card payments"
            subtitle="Allow wallet funding from saved cards"
            value={allowCardPayments}
            disabled={isLoading || isSaving}
            onValueChange={setAllowCardPayments}
          />
          <View style={{ height: 1, marginLeft: 66, backgroundColor: LINE }} />
          <ToggleRow
            icon={Landmark}
            title="Direct debit"
            subtitle="Allow funding from active mandates"
            value={allowDirectDebitPayments}
            disabled={isLoading || isSaving}
            onValueChange={setAllowDirectDebitPayments}
          />
        </View>

        <View style={{ marginTop: 22 }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ marginBottom: 10, fontSize: 17, color: INK }}>
            Single transaction limit
          </Text>
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
            <SlidersHorizontal color={MUTED} size={19} />
            <TextInput
              value={singleTransactionLimit}
              onChangeText={(value) => setSingleTransactionLimit(value.replace(/\D/g, ''))}
              keyboardType="number-pad"
              editable={!isLoading && !isSaving}
              placeholder="500000"
              placeholderTextColor="#A8A29A"
              style={{ flex: 1, marginLeft: 10, color: INK, fontSize: 18, fontWeight: '700' }}
            />
          </View>
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
              Save settings
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
