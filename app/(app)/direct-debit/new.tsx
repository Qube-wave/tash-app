import {
  ApiRequestError,
  createDirectDebitMandate,
  listBanks,
  resolveBankAccount,
  type Bank,
  type ResolvedBankAccount,
} from '@/apis';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Building2, CheckCircle2 } from 'lucide-react-native';
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
const BLACK = '#050505';
const LINE = '#DFE1D4';
const DANGER = '#B42318';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad';
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

export default function NewDirectDebitMandateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [banks, setBanks] = React.useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = React.useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = React.useState('');
  const [maximumAmount, setMaximumAmount] = React.useState('50000');
  const [resolvedAccount, setResolvedAccount] = React.useState<ResolvedBankAccount | null>(null);
  const [isLoadingBanks, setIsLoadingBanks] = React.useState(true);
  const [isResolving, setIsResolving] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadBanks() {
      try {
        const result = await listBanks({ signal: controller.signal });
        setBanks(result);
        setSelectedBank(result[0] ?? null);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof ApiRequestError ? error.message : 'Unable to load banks.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingBanks(false);
        }
      }
    }

    loadBanks();

    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    setResolvedAccount(null);
  }, [accountNumber, selectedBank?.code]);

  const parsedMaximumAmount = Number(maximumAmount);
  const canResolve = Boolean(selectedBank) && accountNumber.length === 10 && !isResolving;
  const canCreate = Boolean(resolvedAccount) && parsedMaximumAmount > 0 && !isSubmitting;

  const handleResolve = async () => {
    if (!canResolve || !selectedBank) {
      return;
    }

    setIsResolving(true);
    setErrorMessage(null);

    try {
      const account = await resolveBankAccount({ bankCode: selectedBank.code, accountNumber });
      setResolvedAccount(account);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Unable to resolve account.'
      );
    } finally {
      setIsResolving(false);
    }
  };

  const handleCreate = async () => {
    if (!canCreate || !selectedBank || !resolvedAccount) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const mandate = await createDirectDebitMandate({
        bankCode: selectedBank.code,
        accountNumber,
        accountName: resolvedAccount.accountName,
        maximumAmount: parsedMaximumAmount,
        currency: selectedBank.currency || 'NGN',
      });

      if (mandate.status === 'requires_authorization') {
        router.replace({
          pathname: '/direct-debit/authorize' as never,
          params: { uuid: mandate.uuid },
        });
        return;
      }

      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Unable to create mandate.'
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
          {isLoadingBanks ? <ActivityIndicator color={ORANGE} /> : null}
        </View>

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
            <Building2 color={ORANGE} size={27} />
          </View>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: INK, fontSize: 28 }}>
            Direct debit
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, color: MUTED, fontSize: 15 }}>
            Resolve your bank account before creating a mandate.
          </Text>
        </View>

        <View style={{ marginTop: 28 }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ marginBottom: 10, color: INK, fontSize: 14 }}>
            Bank
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}>
            {banks.map((bank) => {
              const selected = selectedBank?.code === bank.code;
              return (
                <Pressable
                  key={bank.code}
                  onPress={() => setSelectedBank(bank)}
                  style={{
                    height: 42,
                    borderRadius: 21,
                    paddingHorizontal: 16,
                    backgroundColor: selected ? BLACK : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: selected ? BLACK : LINE,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    font={{ family: 'SourceSans3', weight: 'Bold' }}
                    style={{ color: selected ? '#FFFFFF' : INK, fontSize: 13 }}>
                    {bank.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ gap: 16, marginTop: 24 }}>
          <Field
            label="Account number"
            value={accountNumber}
            onChangeText={(value) => setAccountNumber(value.replace(/\D/g, '').slice(0, 10))}
            placeholder="0123456789"
            keyboardType="number-pad"
          />
          <Field
            label="Maximum amount"
            value={maximumAmount}
            onChangeText={(value) => setMaximumAmount(value.replace(/\D/g, ''))}
            placeholder="50000"
            keyboardType="number-pad"
          />
        </View>

        <Pressable
          disabled={!canResolve}
          onPress={handleResolve}
          style={{
            marginTop: 18,
            height: 50,
            borderRadius: 25,
            backgroundColor: canResolve ? BLACK : '#E5E7DA',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {isResolving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: canResolve ? '#FFFFFF' : MUTED, fontSize: 15 }}>
              Resolve account
            </Text>
          )}
        </Pressable>

        {resolvedAccount ? (
          <View
            style={{
              marginTop: 18,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: '#FFFFFF',
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}>
            <CheckCircle2 color={ORANGE} size={23} />
            <View style={{ flex: 1 }}>
              <Text
                font={{ family: 'SourceSans3', weight: 'Bold' }}
                style={{ color: INK, fontSize: 16 }}>
                {resolvedAccount.accountName}
              </Text>
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ marginTop: 1, color: MUTED, fontSize: 13 }}>
                {resolvedAccount.bankName} • {resolvedAccount.accountNumber}
              </Text>
            </View>
          </View>
        ) : null}

        {errorMessage ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 16, color: DANGER, fontSize: 14 }}>
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          disabled={!canCreate}
          onPress={handleCreate}
          style={{
            marginTop: 28,
            height: 56,
            borderRadius: 28,
            backgroundColor: canCreate ? ORANGE : '#E5E7DA',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {isSubmitting ? (
            <ActivityIndicator color={INK} />
          ) : (
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: INK, fontSize: 16 }}>
              Create mandate
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
