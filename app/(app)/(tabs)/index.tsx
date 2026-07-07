import { Text } from '@/components/ui/text';
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
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Transaction = {
  title: string;
  date: string;
  amount: string;
  positive?: boolean;
  icon: React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;
};

const TRANSACTIONS: Transaction[] = [
  { title: 'Shopping', date: 'Today', amount: '-₦75.50', icon: ShoppingBag },
  { title: 'Salary', date: 'Yesterday', amount: '+₦5,000', positive: true, icon: WalletCards },
  { title: 'Cash', date: 'Last Month', amount: '-₦200.00', icon: HandCoins },
  { title: 'Utilities', date: 'Last Month', amount: '-₦120.00', icon: CircleDollarSign },
  { title: 'Mobile', date: 'Last Month', amount: '-₦10.00', icon: Smartphone },
];

const BG = '#FAFAF1';
const INK = '#151713';
const MUTED = '#6F746A';
const ORANGE = '#FF6A12';
const GREEN = '#168A48';
const SOFT = '#EFF0E6';

function Header() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
            style={{ fontSize: 20, color: INK }}>
            T
          </Text>
        </View>
        <Text font={{ family: 'SourceSans3', weight: 'Bold' }} style={{ fontSize: 19, color: INK }}>
          Hello, Robert
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

function BalanceCard() {
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
        Total Balance
      </Text>
      <Text
        font={{ family: 'SourceSans3', weight: 'Bold' }}
        style={{ color: '#FFFFFF', fontSize: 32, lineHeight: 38, marginTop: 2 }}>
        ₦13,938
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
        <Pressable
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

function TransactionRow({ item }: { item: Transaction }) {
  const Icon = item.icon;

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
          {item.title}
        </Text>
        <Text
          font={{ family: 'SourceSans3', weight: 'SemiBold' }}
          style={{ fontSize: 13, color: MUTED, marginTop: 1 }}>
          {item.date}
        </Text>
      </View>
      <Text
        font={{ family: 'SourceSans3', weight: 'Bold' }}
        style={{ fontSize: 15, color: item.positive ? GREEN : INK }}>
        {item.amount}
      </Text>
    </View>
  );
}

export default function DashboardHome() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 22,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 104,
        }}>
        <Header />
        <BalanceCard />

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
          {TRANSACTIONS.map((item) => (
            <TransactionRow key={`${item.title}-${item.date}`} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
