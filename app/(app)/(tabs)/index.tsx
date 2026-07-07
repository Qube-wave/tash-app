import {
  ApiRequestError,
  listTransactions,
  listWallets,
  type TransactionRecord,
  type Wallet,
} from '@/apis';
import { Text } from '@/components/ui/text';
import { useSession } from '@/providers/session-provider';
import { useRouter } from 'expo-router';
import {
  Bell,
  CircleDollarSign,
  HandCoins,
  MoveUpRight,
  Plus,
  ShoppingBag,
  Smartphone,
  WalletCards,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#FAFAF1';
const INK = '#151713';
const MUTED = '#6F746A';
const ORANGE = '#FF6A12';
const GREEN = '#168A48';
const SOFT = '#EFF0E6';
const DANGER = '#B42318';

const TRANSACTION_ICONS = [ShoppingBag, WalletCards, HandCoins, CircleDollarSign, Smartphone];

function formatMinorAmount(value: number, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function formatTransactionDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat('en-NG', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function getFirstName(name?: string | null) {
  return name?.trim() || 'there';
}

function Header() {
  const { user } = useSession();

  const initials = `${user?.profile.firstName?.[0] ?? ''}${user?.profile.lastName?.[0] ?? ''}`;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          flex: 1,
        }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#F2E983',
            borderWidth: 3,
            borderColor: '#050505',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            font={{ family: 'PlayfairDisplay', weight: 'Black' }}
            style={{ fontSize: 18, color: INK }}>
            {initials.toUpperCase() || 'T'}
          </Text>
        </View>

        <Text
          font={{ family: 'SourceSans3', weight: 'Bold' }}
          numberOfLines={1}
          style={{ flex: 1, fontSize: 19, color: INK }}>
          Hello, {getFirstName(user?.profile.firstName)}
        </Text>
      </View>

      <Pressable
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: SOFT,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Bell color={INK} size={22} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function BalanceCard({
  wallet,
  isLoading,
  onAdd,
  onTransfer,
}: {
  wallet: Wallet | null;
  isLoading: boolean;
  onAdd: () => void;
  onTransfer: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: '#000000',
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingTop: 16,
        marginHorizontal: -10,
        paddingBottom: 14,
        marginTop: 26,
      }}>
      <Text
        font={{ family: 'SourceSans3', weight: 'SemiBold' }}
        style={{ color: '#D7D7D0', fontSize: 14 }}>
        Available Balance
      </Text>

      <View style={{ minHeight: 40, justifyContent: 'center' }}>
        {isLoading ? (
          <ActivityIndicator color={ORANGE} style={{ alignSelf: 'flex-start', marginTop: 8 }} />
        ) : (
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{
              color: '#FFFFFF',
              fontSize: 32,
              lineHeight: 38,
              marginTop: 2,
            }}>
            {wallet ? formatMinorAmount(wallet.availableBalance, wallet.currency) : '₦0.00'}
          </Text>
        )}
      </View>

      <Text
        font={{ family: 'SourceSans3', weight: 'SemiBold' }}
        style={{ color: '#8E8E86', fontSize: 13, marginTop: 4 }}>
        {wallet ? `${wallet.currency} wallet • ${titleCase(wallet.status)}` : 'No wallet found'}
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
        <Pressable
          onPress={onAdd}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 24,
            backgroundColor: ORANGE,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}>
          <Plus color={INK} size={24} strokeWidth={2.6} />

          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: INK, fontSize: 15 }}>
            Add
          </Text>
        </Pressable>

        <Pressable
          onPress={onTransfer}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#242424',
            borderWidth: 1,
            borderColor: '#3A3A3A',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}>
          <MoveUpRight color="#FFFFFF" size={22} strokeWidth={2.2} />

          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: '#FFFFFF', fontSize: 15 }}>
            Transfer
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function TransactionRow({ item, index }: { item: TransactionRecord; index: number }) {
  const Icon = TRANSACTION_ICONS[index % TRANSACTION_ICONS.length];
  const isCredit = item.direction === 'credit';
  const label = item.description || item.entryType || item.type || 'Transaction';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
      }}>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: SOFT,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
        <Icon color={INK} size={22} strokeWidth={2} />
      </View>

      <View style={{ flex: 1 }}>
        <Text font={{ family: 'SourceSans3', weight: 'Bold' }} style={{ fontSize: 15, color: INK }}>
          {titleCase(label)}
        </Text>

        <Text
          font={{ family: 'SourceSans3', weight: 'SemiBold' }}
          style={{ fontSize: 13, color: MUTED, marginTop: 1 }}>
          {formatTransactionDate(item.createdAt)} • {titleCase(item.status)}
        </Text>
      </View>

      <Text
        font={{ family: 'SourceSans3', weight: 'Bold' }}
        style={{ fontSize: 15, color: isCredit ? GREEN : INK }}>
        {isCredit ? '+' : '-'}
        {formatMinorAmount(item.amount, item.currency)}
      </Text>
    </View>
  );
}

export default function DashboardHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [wallet, setWallet] = React.useState<Wallet | null>(null);
  const [transactions, setTransactions] = React.useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const loadDashboard = React.useCallback(async (signal?: AbortSignal) => {
    setErrorMessage(null);

    try {
      const [wallets, transactionPage] = await Promise.all([
        listWallets({ signal }),
        listTransactions({ limit: 5 }, { signal }),
      ]);

      setWallet(wallets[0] ?? null);
      setTransactions(transactionPage.items);
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setErrorMessage(error instanceof ApiRequestError ? error.message : 'Unable to load wallet.');
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);

    loadDashboard(controller.signal).finally(() => {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    });

    return () => controller.abort();
  }, [loadDashboard]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboard();
    setIsRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{
          paddingTop: insets.top + 22,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 104,
        }}>
        <Header />

        <BalanceCard
          wallet={wallet}
          isLoading={isLoading}
          onAdd={() => router.push('/wallet/add' as never)}
          onTransfer={() => router.push('/wallet/transfer' as never)}
        />

        {errorMessage ? (
          <View
            style={{
              marginTop: 18,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#FECACA',
              backgroundColor: '#FFF1F0',
              padding: 14,
            }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ color: DANGER, fontSize: 14 }}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 28,
          }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ fontSize: 21, color: INK }}>
            Recent Transactions
          </Text>

          <Pressable>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ fontSize: 14, color: ORANGE }}>
              View all
            </Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 8 }}>
          {transactions.length > 0 ? (
            transactions.map((item, index) => (
              <TransactionRow key={item.uuid || item.reference} item={item} index={index} />
            ))
          ) : !isLoading ? (
            <View style={{ paddingVertical: 26, alignItems: 'center' }}>
              <Text
                font={{ family: 'SourceSans3', weight: 'Bold' }}
                style={{ color: INK, fontSize: 16 }}>
                No transactions yet
              </Text>

              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ marginTop: 3, color: MUTED, fontSize: 14 }}>
                Your wallet activity will appear here.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
