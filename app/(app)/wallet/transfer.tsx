import {
  ApiRequestError,
  listBanks,
  listCards,
  listDirectDebitMandates,
  listWallets,
  requeryTransfer,
  resolveBankAccount,
  resolveRecipient,
  sendBankTransfer,
  sendTashTransfer,
  type Bank,
  type Card,
  type DirectDebitMandate,
  type ResolvedBankAccount,
  type ResolvedRecipient,
  type TransferFundingSource,
  type Wallet,
} from '@/apis';
import { Text } from '@/components/ui/text';
import { useSession } from '@/providers/session-provider';
import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  AtSign,
  CheckCircle2,
  CreditCard,
  Landmark,
  MoveUpRight,
  Search,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
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

type TransferMode = 'tash' | 'bank';

function createIdempotencyKey() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function sanitizeAmount(value: string) {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  return rest.length > 0 ? `${whole}.${rest.join('').slice(0, 2)}` : whole;
}

function parseAmountMinor(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function formatMinorAmount(value: number, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
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
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
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

function SegmentButton({
  active,
  label,
  Icon,
  onPress,
}: {
  active: boolean;
  label: string;
  Icon: React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minWidth: 0,
        height: 48,
        borderRadius: 24,
        backgroundColor: active ? BLACK : '#FFFFFF',
        borderWidth: 1,
        borderColor: active ? BLACK : LINE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        paddingHorizontal: 10,
      }}>
      <Icon color={active ? '#FFFFFF' : INK} size={18} />
      <Text
        font={{ family: 'SourceSans3', weight: 'Bold' }}
        numberOfLines={1}
        style={{ color: active ? '#FFFFFF' : INK, fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function WalletTransferScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useSession();
  const [mode, setMode] = React.useState<TransferMode>('tash');
  const [fundingSource, setFundingSource] = React.useState<TransferFundingSource>('wallet');
  const [wallet, setWallet] = React.useState<Wallet | null>(null);
  const [cards, setCards] = React.useState<Card[]>([]);
  const [mandates, setMandates] = React.useState<DirectDebitMandate[]>([]);
  const [selectedCardUuid, setSelectedCardUuid] = React.useState<string | null>(null);
  const [selectedMandateUuid, setSelectedMandateUuid] = React.useState<string | null>(null);
  const [banks, setBanks] = React.useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = React.useState<Bank | null>(null);
  const [bankSearch, setBankSearch] = React.useState('');
  const [accountNumber, setAccountNumber] = React.useState('');
  const [resolvedAccount, setResolvedAccount] = React.useState<ResolvedBankAccount | null>(null);
  const [paymentTag, setPaymentTag] = React.useState('');
  const [resolvedRecipient, setResolvedRecipient] = React.useState<ResolvedRecipient | null>(null);
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [transactionPin, setTransactionPin] = React.useState('');
  const [transferRequestKey, setTransferRequestKey] = React.useState<string | null>(null);
  const [processingReference, setProcessingReference] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isResolvingBank, setIsResolvingBank] = React.useState(false);
  const [isResolvingRecipient, setIsResolvingRecipient] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isRequerying, setIsRequerying] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const activeCards = cards.filter((card) => card.status === 'active');
  const activeMandates = mandates.filter((mandate) => mandate.status === 'active');
  const normalizedPaymentTag = paymentTag.replace(/^[@$]/, '').trim().toLowerCase();
  const amountMinor = parseAmountMinor(amount);
  const insufficientBalance = Boolean(
    fundingSource === 'wallet' && wallet && amountMinor > wallet.availableBalance
  );
  const isSelfTransfer = Boolean(
    normalizedPaymentTag && user?.paymentTag?.toLowerCase() === normalizedPaymentTag
  );
  const filteredBanks = banks.filter((bank) => {
    const query = bankSearch.trim().toLowerCase();
    return (
      !query ||
      bank.name.toLowerCase().includes(query) ||
      bank.code.toLowerCase().includes(query) ||
      bank.currency.toLowerCase().includes(query)
    );
  });
  const hasFundingSource =
    fundingSource === 'wallet' ||
    (fundingSource === 'card' && Boolean(selectedCardUuid)) ||
    (fundingSource === 'direct_debit' && Boolean(selectedMandateUuid));
  const canResolveBank = Boolean(selectedBank) && accountNumber.length === 10 && !isResolvingBank;
  const canResolveRecipient =
    normalizedPaymentTag.length > 0 && !isSelfTransfer && !isResolvingRecipient;
  const canSubmitTash =
    mode === 'tash' &&
    Boolean(wallet) &&
    Boolean(resolvedRecipient) &&
    hasFundingSource &&
    amountMinor > 0 &&
    !insufficientBalance &&
    transactionPin.length >= 4 &&
    !isSubmitting;
  const canSubmitBank =
    mode === 'bank' &&
    Boolean(wallet) &&
    Boolean(selectedBank) &&
    Boolean(resolvedAccount) &&
    hasFundingSource &&
    amountMinor > 0 &&
    !insufficientBalance &&
    transactionPin.length >= 4 &&
    !isSubmitting;
  const canSubmit = canSubmitTash || canSubmitBank;

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadTransferData() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [wallets, bankList, savedCards, savedMandates] = await Promise.all([
          listWallets({ signal: controller.signal }),
          listBanks({ signal: controller.signal }),
          listCards({ signal: controller.signal }),
          listDirectDebitMandates({ signal: controller.signal }),
        ]);
        const usableCards = savedCards.filter((card) => card.status === 'active');
        const usableMandates = savedMandates.filter((mandate) => mandate.status === 'active');
        setWallet(wallets[0] ?? null);
        setBanks(bankList);
        setSelectedBank(bankList[0] ?? null);
        setCards(savedCards);
        setMandates(savedMandates);
        setSelectedCardUuid((current) =>
          current && usableCards.some((card) => card.uuid === current)
            ? current
            : (usableCards[0]?.uuid ?? null)
        );
        setSelectedMandateUuid((current) =>
          current && usableMandates.some((mandate) => mandate.uuid === current)
            ? current
            : (usableMandates[0]?.uuid ?? null)
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof ApiRequestError ? error.message : 'Unable to load transfer setup.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadTransferData();
    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    setResolvedAccount(null);
    setTransferRequestKey(null);
  }, [accountNumber, selectedBank?.code]);

  React.useEffect(() => {
    setResolvedRecipient(null);
    setTransferRequestKey(null);
  }, [normalizedPaymentTag]);

  React.useEffect(() => {
    setTransferRequestKey(null);
    setProcessingReference(null);
  }, [
    mode,
    fundingSource,
    amount,
    description,
    resolvedAccount?.accountNumber,
    resolvedRecipient?.uuid,
    selectedCardUuid,
    selectedMandateUuid,
  ]);

  const buildFundingPayload = () => {
    if (fundingSource === 'card') {
      return { fundingSource, cardUuid: selectedCardUuid ?? undefined };
    }

    if (fundingSource === 'direct_debit') {
      return { fundingSource, mandateUuid: selectedMandateUuid ?? undefined };
    }

    return { fundingSource };
  };

  const handleResolveBank = async () => {
    if (!canResolveBank || !selectedBank) return;
    setIsResolvingBank(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      setResolvedAccount(await resolveBankAccount({ bankCode: selectedBank.code, accountNumber }));
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Unable to resolve account.'
      );
    } finally {
      setIsResolvingBank(false);
    }
  };

  const handleResolveRecipient = async () => {
    if (!canResolveRecipient) return;
    setIsResolvingRecipient(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      setResolvedRecipient(await resolveRecipient(normalizedPaymentTag));
    } catch (error) {
      setErrorMessage(error instanceof ApiRequestError ? error.message : 'Unable to resolve user.');
    } finally {
      setIsResolvingRecipient(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !wallet) return;
    const idempotencyKey = transferRequestKey ?? createIdempotencyKey();
    setTransferRequestKey(idempotencyKey);
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      if (mode === 'tash') {
        if (!resolvedRecipient) return;
        const result = await sendTashTransfer(
          {
            walletUuid: wallet.walletUuid,
            recipient: resolvedRecipient.paymentTag,
            amount: amountMinor,
            currency: wallet.currency,
            description: description.trim() || undefined,
            transactionPin,
            ...buildFundingPayload(),
          },
          { idempotencyKey }
        );
        setStatusMessage(`Transfer ${titleCase(result.status)}.`);
      } else {
        if (!selectedBank || !resolvedAccount) return;
        const result = await sendBankTransfer(
          {
            walletUuid: wallet.walletUuid,
            bankCode: selectedBank.code,
            accountNumber,
            accountName: resolvedAccount.accountName,
            amount: amountMinor,
            currency: wallet.currency,
            description: description.trim() || undefined,
            transactionPin,
            ...buildFundingPayload(),
          },
          { idempotencyKey }
        );
        if (result.status === 'processing' || result.status === 'pending') {
          setProcessingReference(result.reference);
        }
        setStatusMessage(
          result.status === 'processing' || result.status === 'pending'
            ? 'Transfer processing.'
            : result.status === 'successful'
              ? 'Transfer successful.'
              : result.status === 'failed'
                ? 'Transfer failed.'
                : `Transfer ${titleCase(result.status)}.`
        );
      }
      setTransferRequestKey(null);
      setTransactionPin('');
      setAmount('');
      setDescription('');
    } catch (error) {
      setTransactionPin('');
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Unable to send transfer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequery = async () => {
    if (!processingReference || isRequerying) return;
    setIsRequerying(true);
    setErrorMessage(null);
    try {
      const result = await requeryTransfer(processingReference);
      setStatusMessage(`Transfer ${titleCase(result.status)}.`);
      if (result.status !== 'processing' && result.status !== 'pending') {
        setProcessingReference(null);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Unable to refresh transfer status.'
      );
    } finally {
      setIsRequerying(false);
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
          paddingBottom: insets.bottom + 140,
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
            <MoveUpRight color={ORANGE} size={27} />
          </View>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: INK, fontSize: 28 }}>
            Transfer
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, color: MUTED, fontSize: 15, lineHeight: 21 }}>
            Send from wallet, saved card, or active direct debit mandate.
          </Text>
        </View>

        {wallet ? (
          <View style={{ marginTop: 22, borderRadius: 18, backgroundColor: BLACK, padding: 16 }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ color: '#D7D7D0', fontSize: 13 }}>
              Wallet balance
            </Text>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ marginTop: 2, color: '#FFFFFF', fontSize: 24 }}>
              {formatMinorAmount(wallet.availableBalance, wallet.currency)}
            </Text>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 22 }}>
          <SegmentButton
            active={mode === 'tash'}
            label="Tash"
            Icon={AtSign}
            onPress={() => setMode('tash')}
          />
          <SegmentButton
            active={mode === 'bank'}
            label="Bank"
            Icon={Landmark}
            onPress={() => setMode('bank')}
          />
        </View>

        <View style={{ marginTop: 24 }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ marginBottom: 10, color: INK, fontSize: 14 }}>
            Funding source
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <SegmentButton
              active={fundingSource === 'wallet'}
              label="Wallet"
              Icon={Landmark}
              onPress={() => setFundingSource('wallet')}
            />
            <SegmentButton
              active={fundingSource === 'card'}
              label="Card"
              Icon={CreditCard}
              onPress={() => setFundingSource('card')}
            />
            <SegmentButton
              active={fundingSource === 'direct_debit'}
              label="Debit"
              Icon={Landmark}
              onPress={() => setFundingSource('direct_debit')}
            />
          </View>
        </View>

        {fundingSource === 'card' ? (
          <View style={{ gap: 10, marginTop: 14 }}>
            {activeCards.length > 0 ? (
              activeCards.map((card) => {
                const selected = selectedCardUuid === card.uuid;
                return (
                  <Pressable
                    key={card.uuid}
                    onPress={() => setSelectedCardUuid(card.uuid)}
                    style={{
                      minHeight: 54,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: selected ? BLACK : LINE,
                      backgroundColor: selected ? BLACK : '#FFFFFF',
                      justifyContent: 'center',
                      paddingHorizontal: 16,
                    }}>
                    <Text
                      font={{ family: 'SourceSans3', weight: 'Bold' }}
                      style={{ color: selected ? '#FFFFFF' : INK, fontSize: 15 }}>
                      {titleCase(card.brand)} •••• {card.lastFourDigits}
                    </Text>
                    <Text
                      font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                      style={{ marginTop: 1, color: selected ? '#D7D7D0' : MUTED, fontSize: 13 }}>
                      {card.currency}
                    </Text>
                  </Pressable>
                );
              })
            ) : (
              <Pressable
                onPress={() => router.push('/cards/add' as never)}
                style={{
                  minHeight: 64,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: LINE,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 14,
                }}>
                <Text
                  font={{ family: 'SourceSans3', weight: 'Bold' }}
                  style={{ color: INK, fontSize: 15 }}>
                  Add a saved card
                </Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {fundingSource === 'direct_debit' ? (
          <View style={{ gap: 10, marginTop: 14 }}>
            {activeMandates.length > 0 ? (
              activeMandates.map((mandate) => {
                const selected = selectedMandateUuid === mandate.uuid;
                return (
                  <Pressable
                    key={mandate.uuid}
                    onPress={() => setSelectedMandateUuid(mandate.uuid)}
                    style={{
                      minHeight: 54,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: selected ? BLACK : LINE,
                      backgroundColor: selected ? BLACK : '#FFFFFF',
                      justifyContent: 'center',
                      paddingHorizontal: 16,
                    }}>
                    <Text
                      font={{ family: 'SourceSans3', weight: 'Bold' }}
                      style={{ color: selected ? '#FFFFFF' : INK, fontSize: 15 }}>
                      {mandate.bankName} •••• {mandate.accountNumberLastFour}
                    </Text>
                    <Text
                      font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                      style={{ marginTop: 1, color: selected ? '#D7D7D0' : MUTED, fontSize: 13 }}>
                      {titleCase(mandate.status)}
                    </Text>
                  </Pressable>
                );
              })
            ) : (
              <Pressable
                onPress={() => router.push('/direct-debit/new' as never)}
                style={{
                  minHeight: 64,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: LINE,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 14,
                }}>
                <Text
                  font={{ family: 'SourceSans3', weight: 'Bold' }}
                  style={{ color: INK, fontSize: 15 }}>
                  Link a bank mandate
                </Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {mode === 'tash' ? (
          <View style={{ gap: 16, marginTop: 24 }}>
            <Field
              label="Payment tag"
              value={paymentTag}
              onChangeText={setPaymentTag}
              placeholder="receiver"
              autoCapitalize="none"
            />
            <Pressable
              disabled={!canResolveRecipient}
              onPress={handleResolveRecipient}
              style={{
                height: 50,
                borderRadius: 25,
                backgroundColor: canResolveRecipient ? BLACK : '#E5E7DA',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {isResolvingRecipient ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  font={{ family: 'SourceSans3', weight: 'Bold' }}
                  style={{ color: canResolveRecipient ? '#FFFFFF' : MUTED, fontSize: 15 }}>
                  Resolve user
                </Text>
              )}
            </Pressable>
            {isSelfTransfer ? (
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ color: DANGER, fontSize: 14 }}>
                You cannot send money to yourself.
              </Text>
            ) : null}
            {resolvedRecipient ? (
              <View
                style={{
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
                    {resolvedRecipient.firstName} {resolvedRecipient.lastName}
                  </Text>
                  <Text
                    font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                    style={{ marginTop: 1, color: MUTED, fontSize: 13 }}>
                    @{resolvedRecipient.paymentTag}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {mode === 'bank' ? (
          <>
            <View style={{ marginTop: 26 }}>
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
                  editable={!isLoading}
                  placeholder="Search banks"
                  placeholderTextColor="#A8A29A"
                  style={{ flex: 1, marginLeft: 8, color: INK, fontSize: 15, fontWeight: '700' }}
                />
              </View>
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
            </View>
            <View style={{ gap: 16, marginTop: 24 }}>
              <Field
                label="Account number"
                value={accountNumber}
                onChangeText={(value) => setAccountNumber(value.replace(/\D/g, '').slice(0, 10))}
                placeholder="0123456789"
                keyboardType="number-pad"
              />
              <Pressable
                disabled={!canResolveBank}
                onPress={handleResolveBank}
                style={{
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: canResolveBank ? BLACK : '#E5E7DA',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {isResolvingBank ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    font={{ family: 'SourceSans3', weight: 'Bold' }}
                    style={{ color: canResolveBank ? '#FFFFFF' : MUTED, fontSize: 15 }}>
                    Resolve account
                  </Text>
                )}
              </Pressable>
              {resolvedAccount ? (
                <View
                  style={{
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
            </View>
          </>
        ) : null}

        <View style={{ gap: 16, marginTop: 24 }}>
          <Field
            label="Amount"
            value={amount}
            onChangeText={(value) => setAmount(sanitizeAmount(value))}
            placeholder="5000"
            keyboardType="decimal-pad"
          />
          <Field
            label="Narration"
            value={description}
            onChangeText={setDescription}
            placeholder="Optional narration"
          />
          <Field
            label="Transaction PIN"
            value={transactionPin}
            onChangeText={(value) => setTransactionPin(value.replace(/\D/g, '').slice(0, 4))}
            placeholder="1234"
            keyboardType="number-pad"
            secureTextEntry
          />
        </View>

        {insufficientBalance ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 14, color: DANGER, fontSize: 14 }}>
            Amount is higher than your wallet balance. Choose card/direct debit or fund your wallet
            first.
          </Text>
        ) : null}
        {statusMessage ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 16, color: SUCCESS, fontSize: 14, textAlign: 'center' }}>
            {statusMessage}
          </Text>
        ) : null}
        {processingReference ? (
          <Pressable
            disabled={isRequerying}
            onPress={handleRequery}
            style={{
              marginTop: 14,
              height: 44,
              borderRadius: 22,
              backgroundColor: BLACK,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {isRequerying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                font={{ family: 'SourceSans3', weight: 'Bold' }}
                style={{ color: '#FFFFFF', fontSize: 14 }}>
                Check status
              </Text>
            )}
          </Pressable>
        ) : null}
        {errorMessage ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 16, color: DANGER, fontSize: 14, textAlign: 'center' }}>
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
              Send transfer
            </Text>
          )}
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}
