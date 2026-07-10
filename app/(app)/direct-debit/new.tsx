import {
  ApiRequestError,
  getCurrentUser,
  createDirectDebitMandate,
  listBanks,
  resolveBankAccount,
  type Bank,
  type PublicUserProfile,
  type ResolvedBankAccount,
} from '@/apis';
import { Text } from '@/components/ui/text';
import { useSession } from '@/providers/session-provider';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Building2, CheckCircle2, Search } from 'lucide-react-native';
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
  const { user, updateUser } = useSession();
  const [profileUser, setProfileUser] = React.useState<PublicUserProfile | null>(null);
  const [banks, setBanks] = React.useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = React.useState<Bank | null>(null);
  const [bankSearch, setBankSearch] = React.useState('');
  const [accountNumber, setAccountNumber] = React.useState('');
  const [maximumAmount, setMaximumAmount] = React.useState('50000');
  const [resolvedAccount, setResolvedAccount] = React.useState<ResolvedBankAccount | null>(null);
  const [isLoadingBanks, setIsLoadingBanks] = React.useState(true);
  const [bankLoadFailed, setBankLoadFailed] = React.useState(false);
  const [isResolving, setIsResolving] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const contactUser = profileUser ?? user;

  React.useEffect(() => {
    const controller = new AbortController();

    getCurrentUser({ signal: controller.signal })
      .then((currentUser) => {
        setProfileUser(currentUser);
        updateUser(currentUser);
      })
      .catch(() => {
        // Keep using the session user if refreshing the profile fails.
      });

    return () => controller.abort();
  }, [updateUser]);

  const hasEmail = Boolean(contactUser?.email);
  const hasPhoneNumber = Boolean(contactUser?.phoneNumber);
  const missingContactDetails = [
    !hasEmail ? 'email' : null,
    !hasPhoneNumber ? 'phone number' : null,
  ].filter(Boolean) as string[];
  const canStartSetup = missingContactDetails.length === 0;
  const missingContactLabel = missingContactDetails.join(' and ');
  const missingEmail = !hasEmail;
  const missingPhoneNumber = !hasPhoneNumber;

  const loadBanks = React.useCallback(async (signal?: AbortSignal) => {
    setIsLoadingBanks(true);
    setBankLoadFailed(false);
    setErrorMessage(null);

    try {
      const result = await listBanks({ signal });
      setBanks(result);
      setSelectedBank((currentBank) => {
        if (currentBank && result.some((bank) => bank.code === currentBank.code)) {
          return currentBank;
        }

        return result[0] ?? null;
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setBanks([]);
      setSelectedBank(null);
      setBankLoadFailed(true);
      setErrorMessage(error instanceof ApiRequestError ? error.message : 'Unable to load banks.');
    } finally {
      if (!signal?.aborted) {
        setIsLoadingBanks(false);
      }
    }
  }, []);

  React.useEffect(() => {
    if (!canStartSetup) {
      setIsLoadingBanks(false);
      setBanks([]);
      setSelectedBank(null);
      return;
    }

    const controller = new AbortController();
    loadBanks(controller.signal);

    return () => controller.abort();
  }, [canStartSetup, loadBanks]);

  React.useEffect(() => {
    setResolvedAccount(null);
  }, [accountNumber, selectedBank?.code]);

  const parsedMaximumAmount = Number(maximumAmount);
  const filteredBanks = banks.filter((bank) => {
    const query = bankSearch.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      bank.name.toLowerCase().includes(query) ||
      bank.code.toLowerCase().includes(query) ||
      bank.currency.toLowerCase().includes(query)
    );
  });
  const canResolve =
    !bankLoadFailed && Boolean(selectedBank) && accountNumber.length === 10 && !isResolving;
  const canCreate =
    canStartSetup &&
    !bankLoadFailed &&
    Boolean(selectedBank) &&
    Boolean(resolvedAccount) &&
    parsedMaximumAmount > 0 &&
    !isSubmitting;

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
        const authorizationDescription = mandate.metadata?.authorizationDescription;

        router.replace({
          pathname: '/direct-debit/authorize' as never,
          params: {
            uuid: mandate.uuid,
            ...(typeof authorizationDescription === 'string' && authorizationDescription.trim()
              ? { authorizationDescription }
              : {}),
          },
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
              Add your {missingContactLabel} to your profile before setting up direct debit.
            </Text>
            <Pressable
              onPress={() =>
                missingEmail
                  ? router.push({
                      pathname: '/settings/email' as never,
                      params: { next: '/direct-debit/new' },
                    })
                  : missingPhoneNumber
                    ? router.push({
                        pathname: '/settings/phone' as never,
                        params: { next: '/direct-debit/new' },
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
                {missingEmail ? 'Add email' : missingPhoneNumber ? 'Add phone' : 'View profile'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ marginTop: 28 }}>
              <Text
                font={{ family: 'SourceSans3', weight: 'Bold' }}
                style={{ marginBottom: 10, color: INK, fontSize: 14 }}>
                Bank
              </Text>

              <View
                style={{
                  height: 50,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: LINE,
                  backgroundColor: '#FFFFFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  marginBottom: 12,
                }}>
                <Search color={MUTED} size={18} />
                <TextInput
                  value={bankSearch}
                  onChangeText={setBankSearch}
                  editable={!isLoadingBanks && !bankLoadFailed}
                  placeholder="Search banks"
                  placeholderTextColor="#A8A29A"
                  style={{ flex: 1, marginLeft: 8, color: INK, fontSize: 15, fontWeight: '700' }}
                />
              </View>

              {bankLoadFailed ? (
                <View
                  style={{
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: '#FECACA',
                    backgroundColor: '#FFF1F0',
                    padding: 14,
                  }}>
                  <Text
                    font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                    style={{ color: DANGER, fontSize: 14 }}>
                    Could not load banks. Please try again.
                  </Text>
                  <Pressable
                    disabled={isLoadingBanks}
                    onPress={() => loadBanks()}
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 12,
                      height: 38,
                      borderRadius: 19,
                      backgroundColor: BLACK,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isLoadingBanks ? 0.65 : 1,
                    }}>
                    {isLoadingBanks ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text
                        font={{ family: 'SourceSans3', weight: 'Bold' }}
                        style={{ color: '#FFFFFF', fontSize: 13 }}>
                        Retry
                      </Text>
                    )}
                  </Pressable>
                </View>
              ) : null}

              {!bankLoadFailed ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
                  {filteredBanks.map((bank) => {
                    const selected = selectedBank?.code === bank.code;
                    return (
                      <Pressable
                        key={bank.code}
                        onPress={() => setSelectedBank(bank)}
                        style={{
                          minWidth: 92,
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
                          numberOfLines={1}
                          style={{ color: selected ? '#FFFFFF' : INK, fontSize: 13 }}>
                          {bank.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : null}

              {!isLoadingBanks && !bankLoadFailed && filteredBanks.length === 0 ? (
                <Text
                  font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                  style={{ marginTop: 8, color: MUTED, fontSize: 13 }}>
                  No banks match your search.
                </Text>
              ) : null}
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
                label="Mandate limit"
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
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
