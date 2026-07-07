<<<<<<< HEAD
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

  return new Intl.DateTimeFormat('en-NG', { month: 'short', day: 'numeric' }).format(date);
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
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
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
            style={{ color: '#FFFFFF', fontSize: 32, lineHeight: 38, marginTop: 2 }}>
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
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13 }}>
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
=======
import { GradientFill } from '@/components/shared/gradient';
import { Text } from '@/components/ui/text';
import { useColors } from '@/lib/use-colors';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  ScanLine,
  Send,
  Users,
} from 'lucide-react-native';
import * as React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AVATAR = 'https://i.pravatar.cc/100?img=68';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const TXNS = [
  { title: 'Money Received', sub: 'From Adaeze Okoro • Today, 9:41 AM', amount: '+₦45,000', in: true },
  { title: 'Tap & Pay', sub: 'Store purchase • Today, 8:02 AM', amount: '-₦12,000', in: false },
  { title: 'Split Bills', sub: 'With 3 people • Yesterday', amount: '-₦6,500', in: false },
  { title: 'Send Money', sub: 'To Timileyin • Jul 4', amount: '-₦20,000', in: false },
];

export default function DashboardHome() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [hidden, setHidden] = React.useState(false);

  const QUICK = [
    { icon: Send, label: 'Send Money' },
    { icon: Users, label: 'Split Bills' },
    { icon: ScanLine, label: 'Scan / Tap' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* balance panel */}
        <View
          style={{
            paddingTop: insets.top + 14,
            paddingHorizontal: 22,
            paddingBottom: 52,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            overflow: 'hidden',
          }}>
          <GradientFill from={colors.accent} to={colors.accentDeep} />

          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text
                font={{ family: 'SourceSans3', weight: 'Medium' }}
                style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                {greeting()},
              </Text>
              <Text
                font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
                style={{ color: '#FFFFFF', fontSize: 20, marginTop: 1 }}>
                Timileyin
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Bell color="#FFFFFF" size={20} strokeWidth={2} />
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 9,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </View>
              <Image
                source={{ uri: AVATAR }}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff30' }}
              />
            </View>
          </View>

          <Text
            font={{ family: 'SourceSans3', weight: 'Medium' }}
            style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, marginTop: 26 }}>
            Available Balance
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text
                font={{ family: 'SourceSans3', weight: 'Bold' }}
                style={{ color: '#FFFFFF', fontSize: 40, lineHeight: 48, letterSpacing: -0.5 }}>
                {hidden ? '₦ • • • •' : '₦38,400'}
              </Text>
              {!hidden && (
                <Text
                  font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                  style={{ color: 'rgba(255,255,255,0.7)', fontSize: 22, lineHeight: 40 }}>
                  .00
                </Text>
              )}
            </View>
            <Pressable onPress={() => setHidden((v) => !v)} hitSlop={10}>
              {hidden ? (
                <EyeOff color="rgba(255,255,255,0.85)" size={22} />
              ) : (
                <Eye color="rgba(255,255,255,0.85)" size={22} />
              )}
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
            <PanelButton icon={<ArrowDownLeft color="#FFFFFF" size={18} />} label="Add Money" />
            <PanelButton icon={<ArrowUpRight color="#FFFFFF" size={18} />} label="Send Money" />
          </View>
        </View>

        {/* floating quick actions */}
        <View
          style={{
            marginTop: -32,
            marginHorizontal: 22,
            backgroundColor: colors.bg,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            paddingVertical: 18,
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
            elevation: 5,
          }}>
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <Pressable key={q.label} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: colors.accent + '18',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon color={colors.accent} size={21} />
                </View>
                <Text
                  font={{ family: 'SourceSans3', weight: 'Medium' }}
                  style={{ fontSize: 12, color: colors.heading }}>
                  {q.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* body */}
        <View style={{ paddingHorizontal: 22, marginTop: 24 }}>
          {/* request card promo */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.accent + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <CreditCard color={colors.accent} size={22} />
              </View>
              <Text
                font={{ family: 'SourceSans3', weight: 'Medium' }}
                style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.heading }}>
                Link a physical card for seamless spending and split anywhere.
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ fontSize: 15, color: colors.accent }}>
                Link Card
              </Text>
              <ChevronRight color={colors.accent} size={18} />
            </Pressable>
          </View>

          {/* section header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 26,
            }}>
            <Text
              font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
              style={{ fontSize: 18, color: colors.heading }}>
              Recent Activity
            </Text>
            <Pressable>
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ fontSize: 13, color: colors.accent }}>
                See all
              </Text>
            </Pressable>
          </View>

          {/* history list */}
          <View style={{ marginTop: 6 }}>
            {TXNS.map((t, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: t.in ? colors.accent + '1A' : colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {t.in ? (
                    <ArrowDownLeft color={colors.accent} size={20} />
                  ) : (
                    <ArrowUpRight color={colors.heading} size={20} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                    style={{ fontSize: 15, color: colors.heading }}>
                    {t.title}
                  </Text>
                  <Text font={{ family: 'SourceSans3' }} style={{ fontSize: 13, color: colors.subtitle }}>
                    {t.sub}
                  </Text>
                </View>
                <Text
                  font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                  style={{ fontSize: 15, color: t.in ? '#2E9E5B' : colors.heading }}>
                  {t.amount}
                </Text>
              </View>
            ))}
          </View>
>>>>>>> 4edcff91cf02b0ccc5857354ab155381f28cc28e
        </View>
      </ScrollView>
    </View>
  );
}

function PanelButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Pressable
      style={{
        flex: 1,
        height: 46,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.18)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
      {icon}
      <Text
        font={{ family: 'SourceSans3', weight: 'SemiBold' }}
        style={{ color: '#FFFFFF', fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}
