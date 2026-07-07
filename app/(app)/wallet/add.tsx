import {
  ApiRequestError,
  createVirtualAccount,
  fundWalletWithCard,
  fundWalletWithDirectDebit,
  listCards,
  listDirectDebitMandates,
  listVirtualAccounts,
  listWallets,
  type Card,
  type DirectDebitMandate,
  type VirtualAccount,
  type Wallet,
} from '@/apis';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Building2, CreditCard, Landmark, Plus, WalletCards } from 'lucide-react-native';
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

type FundingMode = 'virtual' | 'card' | 'bank';

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

function formatExpiry(value: string | null) {
  if (!value) {
    return 'No expiry';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
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
  keyboardType = 'decimal-pad',
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  secureTextEntry?: boolean;
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

function OptionButton({
  mode,
  activeMode,
  label,
  Icon,
  onPress,
}: {
  mode: FundingMode;
  activeMode: FundingMode;
  label: string;
  Icon: React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;
  onPress: () => void;
}) {
  const active = mode === activeMode;

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
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: 10,
      }}>
      <Icon color={active ? '#FFFFFF' : INK} size={18} />
      <Text
        font={{ family: 'SourceSans3', weight: 'Bold' }}
        numberOfLines={1}
        style={{ color: active ? '#FFFFFF' : INK, fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function AddWalletMoneyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [wallet, setWallet] = React.useState<Wallet | null>(null);
  const [cards, setCards] = React.useState<Card[]>([]);
  const [mandates, setMandates] = React.useState<DirectDebitMandate[]>([]);
  const [virtualAccounts, setVirtualAccounts] = React.useState<VirtualAccount[]>([]);
  const [mode, setMode] = React.useState<FundingMode>('virtual');
  const [selectedCardUuid, setSelectedCardUuid] = React.useState<string | null>(null);
  const [selectedMandateUuid, setSelectedMandateUuid] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState('');
  const [transactionPin, setTransactionPin] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [busyAction, setBusyAction] = React.useState<string | null>(null);
  const [virtualAccountRequestKey, setVirtualAccountRequestKey] = React.useState<string | null>(
    null
  );
  const [cardFundingRequestKey, setCardFundingRequestKey] = React.useState<string | null>(null);
  const [bankFundingRequestKey, setBankFundingRequestKey] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const activeCards = cards.filter((card) => card.status === 'active');
  const activeMandates = mandates.filter((mandate) => mandate.status === 'active');
  const walletVirtualAccount = virtualAccounts.find(
    (account) =>
      account.purpose === 'wallet_funding' &&
      account.status !== 'disabled' &&
      (!account.walletUuid || account.walletUuid === wallet?.walletUuid)
  );
  const amountMinor = parseAmountMinor(amount);
  const canFundCard = Boolean(
    wallet && selectedCardUuid && amountMinor > 0 && transactionPin.length >= 4
  );
  const canFundBank = Boolean(
    wallet && selectedMandateUuid && amountMinor > 0 && transactionPin.length >= 4
  );

  const loadFundingData = React.useCallback(async (signal?: AbortSignal) => {
    setErrorMessage(null);

    try {
      const [wallets, savedCards, savedMandates, accounts] = await Promise.all([
        listWallets({ signal }),
        listCards({ signal }),
        listDirectDebitMandates({ signal }),
        listVirtualAccounts({ signal }),
      ]);

      const defaultWallet = wallets[0] ?? null;
      const availableCards = savedCards.filter((card) => card.status === 'active');
      const availableMandates = savedMandates.filter((mandate) => mandate.status === 'active');

      setWallet(defaultWallet);
      setCards(savedCards);
      setMandates(savedMandates);
      setVirtualAccounts(accounts);
      setSelectedCardUuid((current) =>
        current && availableCards.some((card) => card.uuid === current)
          ? current
          : (availableCards[0]?.uuid ?? null)
      );
      setSelectedMandateUuid((current) =>
        current && availableMandates.some((mandate) => mandate.uuid === current)
          ? current
          : (availableMandates[0]?.uuid ?? null)
      );
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Unable to load funding options.'
      );
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    loadFundingData(controller.signal).finally(() => {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    });

    return () => controller.abort();
  }, [loadFundingData]);

  React.useEffect(() => {
    setCardFundingRequestKey(null);
  }, [amount, selectedCardUuid]);

  React.useEffect(() => {
    setBankFundingRequestKey(null);
  }, [amount, selectedMandateUuid]);

  const handleCreateVirtualAccount = async () => {
    if (!wallet || busyAction) {
      return;
    }

    setBusyAction('virtual');
    setErrorMessage(null);
    setStatusMessage(null);

    const idempotencyKey = virtualAccountRequestKey ?? createIdempotencyKey();
    setVirtualAccountRequestKey(idempotencyKey);

    try {
      const account = await createVirtualAccount(
        {
          walletUuid: wallet.walletUuid,
          type: 'static',
          purpose: 'wallet_funding',
        },
        { idempotencyKey }
      );
      setVirtualAccounts((current) => [account, ...current]);
      setVirtualAccountRequestKey(null);
      setStatusMessage('Virtual account created.');
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError
          ? error.message
          : 'Unable to create virtual account. BVN verification may be required.'
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleCardFunding = async () => {
    if (!wallet || !selectedCardUuid || !canFundCard || busyAction) {
      return;
    }

    setBusyAction('card');
    setErrorMessage(null);
    setStatusMessage(null);

    const idempotencyKey = cardFundingRequestKey ?? createIdempotencyKey();
    setCardFundingRequestKey(idempotencyKey);

    try {
      const result = await fundWalletWithCard(
        wallet.walletUuid,
        {
          cardUuid: selectedCardUuid,
          amount: amountMinor,
          currency: wallet.currency,
          transactionPin,
        },
        { idempotencyKey }
      );
      setCardFundingRequestKey(null);
      setAmount('');
      setTransactionPin('');
      await loadFundingData();
      setStatusMessage(`Card funding ${titleCase(result.status)}.`);
    } catch (error) {
      setTransactionPin('');
      setErrorMessage(error instanceof ApiRequestError ? error.message : 'Unable to fund wallet.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleBankFunding = async () => {
    if (!wallet || !selectedMandateUuid || !canFundBank || busyAction) {
      return;
    }

    setBusyAction('bank');
    setErrorMessage(null);
    setStatusMessage(null);

    const idempotencyKey = bankFundingRequestKey ?? createIdempotencyKey();
    setBankFundingRequestKey(idempotencyKey);

    try {
      const result = await fundWalletWithDirectDebit(
        wallet.walletUuid,
        {
          mandateUuid: selectedMandateUuid,
          amount: amountMinor,
          currency: wallet.currency,
          transactionPin,
        },
        { idempotencyKey }
      );
      setBankFundingRequestKey(null);
      setAmount('');
      setTransactionPin('');
      await loadFundingData();
      setStatusMessage(
        result.status === 'pending' || result.status === 'processing'
          ? 'Direct debit funding processing.'
          : `Direct debit funding ${titleCase(result.status)}.`
      );
    } catch (error) {
      setTransactionPin('');
      setErrorMessage(error instanceof ApiRequestError ? error.message : 'Unable to fund wallet.');
    } finally {
      setBusyAction(null);
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
            <WalletCards color={ORANGE} size={27} />
          </View>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: INK, fontSize: 28 }}>
            Add money
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, color: MUTED, fontSize: 15, lineHeight: 21 }}>
            Fund your wallet with a virtual account, linked card, or linked bank.
          </Text>
        </View>

        {wallet ? (
          <View
            style={{
              marginTop: 22,
              borderRadius: 18,
              backgroundColor: BLACK,
              padding: 16,
            }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ color: '#D7D7D0', fontSize: 13 }}>
              Available balance
            </Text>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ marginTop: 2, color: '#FFFFFF', fontSize: 24 }}>
              {formatMinorAmount(wallet.availableBalance, wallet.currency)}
            </Text>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 22 }}>
          <OptionButton
            mode="virtual"
            activeMode={mode}
            label="Account"
            Icon={Landmark}
            onPress={() => setMode('virtual')}
          />
          <OptionButton
            mode="card"
            activeMode={mode}
            label="Card"
            Icon={CreditCard}
            onPress={() => setMode('card')}
          />
          <OptionButton
            mode="bank"
            activeMode={mode}
            label="Bank"
            Icon={Building2}
            onPress={() => setMode('bank')}
          />
        </View>

        {mode === 'virtual' ? (
          <View
            style={{
              marginTop: 20,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: '#FFFFFF',
              padding: 16,
            }}>
            {walletVirtualAccount ? (
              <>
                <Text
                  font={{ family: 'SourceSans3', weight: 'Bold' }}
                  style={{ color: INK, fontSize: 17 }}>
                  {walletVirtualAccount.bankName}
                </Text>
                <Text
                  font={{ family: 'SourceSans3', weight: 'Bold' }}
                  style={{ marginTop: 8, color: INK, fontSize: 24 }}>
                  {walletVirtualAccount.accountNumber}
                </Text>
                <Text
                  font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                  style={{ marginTop: 4, color: MUTED, fontSize: 14 }}>
                  {walletVirtualAccount.accountName}
                </Text>
                <View style={{ marginTop: 10, gap: 4 }}>
                  <Text
                    font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                    style={{ color: MUTED, fontSize: 13 }}>
                    Bank code {walletVirtualAccount.bankCode} • {walletVirtualAccount.currency}
                  </Text>
                  <Text
                    font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                    style={{ color: MUTED, fontSize: 13 }}>
                    {titleCase(walletVirtualAccount.type)} •{' '}
                    {titleCase(walletVirtualAccount.status)}
                  </Text>
                  {walletVirtualAccount.type === 'temporary' ? (
                    <Text
                      font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                      style={{ color: MUTED, fontSize: 13 }}>
                      Expires {formatExpiry(walletVirtualAccount.expiresAt)}
                    </Text>
                  ) : null}
                </View>
              </>
            ) : (
              <>
                <Text
                  font={{ family: 'SourceSans3', weight: 'Bold' }}
                  style={{ color: INK, fontSize: 17 }}>
                  Virtual account
                </Text>
                <Text
                  font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                  style={{ marginTop: 6, color: MUTED, fontSize: 14, lineHeight: 20 }}>
                  Create a permanent wallet funding account. BVN verification may be required.
                </Text>
                <Pressable
                  disabled={!wallet || busyAction === 'virtual'}
                  onPress={handleCreateVirtualAccount}
                  style={{
                    marginTop: 16,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: wallet ? ORANGE : '#E5E7DA',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 8,
                  }}>
                  {busyAction === 'virtual' ? (
                    <ActivityIndicator color={INK} />
                  ) : (
                    <>
                      <Plus color={INK} size={18} />
                      <Text
                        font={{ family: 'SourceSans3', weight: 'Bold' }}
                        style={{ color: INK, fontSize: 15 }}>
                        Create account
                      </Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </View>
        ) : null}

        {mode === 'card' ? (
          <View style={{ marginTop: 20 }}>
            {activeCards.length > 0 ? (
              <View style={{ gap: 10 }}>
                {activeCards.map((card) => {
                  const selected = selectedCardUuid === card.uuid;
                  return (
                    <Pressable
                      key={card.uuid}
                      onPress={() => setSelectedCardUuid(card.uuid)}
                      style={{
                        minHeight: 58,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: selected ? BLACK : LINE,
                        backgroundColor: selected ? BLACK : '#FFFFFF',
                        paddingHorizontal: 16,
                        justifyContent: 'center',
                      }}>
                      <Text
                        font={{ family: 'SourceSans3', weight: 'Bold' }}
                        style={{ color: selected ? '#FFFFFF' : INK, fontSize: 16 }}>
                        {titleCase(card.brand)} •••• {card.lastFourDigits}
                      </Text>
                      <Text
                        font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                        style={{ marginTop: 2, color: selected ? '#D7D7D0' : MUTED, fontSize: 13 }}>
                        {card.currency} {card.isDefault ? '• Default' : ''}
                      </Text>
                    </Pressable>
                  );
                })}
                <Field
                  label="Amount"
                  value={amount}
                  onChangeText={(value) => setAmount(sanitizeAmount(value))}
                  placeholder="5000"
                />
                <Field
                  label="Transaction PIN"
                  value={transactionPin}
                  onChangeText={(value) => setTransactionPin(value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  keyboardType="number-pad"
                  secureTextEntry
                />
                <Pressable
                  disabled={!canFundCard || busyAction === 'card'}
                  onPress={handleCardFunding}
                  style={{
                    height: 54,
                    borderRadius: 27,
                    backgroundColor: canFundCard ? ORANGE : '#E5E7DA',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {busyAction === 'card' ? (
                    <ActivityIndicator color={INK} />
                  ) : (
                    <Text
                      font={{ family: 'SourceSans3', weight: 'Bold' }}
                      style={{ color: INK, fontSize: 16 }}>
                      Fund with card
                    </Text>
                  )}
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => router.push('/cards/add' as never)}
                style={{
                  minHeight: 76,
                  borderRadius: 20,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: LINE,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                }}>
                <Text
                  font={{ family: 'SourceSans3', weight: 'Bold' }}
                  style={{ color: INK, fontSize: 16 }}>
                  Add a linked card
                </Text>
                <Text
                  font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                  style={{ marginTop: 3, color: MUTED, fontSize: 14 }}>
                  You need an active card to fund this way.
                </Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {mode === 'bank' ? (
          <View style={{ marginTop: 20 }}>
            {activeMandates.length > 0 ? (
              <View style={{ gap: 10 }}>
                {activeMandates.map((mandate) => {
                  const selected = selectedMandateUuid === mandate.uuid;
                  return (
                    <Pressable
                      key={mandate.uuid}
                      onPress={() => setSelectedMandateUuid(mandate.uuid)}
                      style={{
                        minHeight: 58,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: selected ? BLACK : LINE,
                        backgroundColor: selected ? BLACK : '#FFFFFF',
                        paddingHorizontal: 16,
                        justifyContent: 'center',
                      }}>
                      <Text
                        font={{ family: 'SourceSans3', weight: 'Bold' }}
                        style={{ color: selected ? '#FFFFFF' : INK, fontSize: 16 }}>
                        {mandate.bankName} •••• {mandate.accountNumberLastFour}
                      </Text>
                      <Text
                        font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                        style={{ marginTop: 2, color: selected ? '#D7D7D0' : MUTED, fontSize: 13 }}>
                        Limit {formatMinorAmount(mandate.maximumAmount, mandate.currency)}
                      </Text>
                    </Pressable>
                  );
                })}
                <Field
                  label="Amount"
                  value={amount}
                  onChangeText={(value) => setAmount(sanitizeAmount(value))}
                  placeholder="5000"
                />
                <Field
                  label="Transaction PIN"
                  value={transactionPin}
                  onChangeText={(value) => setTransactionPin(value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  keyboardType="number-pad"
                  secureTextEntry
                />
                <Pressable
                  disabled={!canFundBank || busyAction === 'bank'}
                  onPress={handleBankFunding}
                  style={{
                    height: 54,
                    borderRadius: 27,
                    backgroundColor: canFundBank ? ORANGE : '#E5E7DA',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {busyAction === 'bank' ? (
                    <ActivityIndicator color={INK} />
                  ) : (
                    <Text
                      font={{ family: 'SourceSans3', weight: 'Bold' }}
                      style={{ color: INK, fontSize: 16 }}>
                      Fund with bank
                    </Text>
                  )}
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => router.push('/direct-debit/new' as never)}
                style={{
                  minHeight: 76,
                  borderRadius: 20,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: LINE,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                }}>
                <Text
                  font={{ family: 'SourceSans3', weight: 'Bold' }}
                  style={{ color: INK, fontSize: 16 }}>
                  Link a bank
                </Text>
                <Text
                  font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                  style={{ marginTop: 3, color: MUTED, fontSize: 14 }}>
                  Add an active mandate to fund this way.
                </Text>
              </Pressable>
            )}
          </View>
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
