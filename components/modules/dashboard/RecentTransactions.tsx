import { Text } from '@/components/ui/text';
import { ArrowDownLeft, ArrowUpRight, Coffee, ShoppingBag } from 'lucide-react-native';
import { View } from 'react-native';

const TRANSACTIONS = [
  {
    id: '1',
    title: 'Starbucks',
    category: 'Food & Drink',
    amount: '-₦5.40',
    date: 'Today, 09:41 AM',
    type: 'debit',
    icon: <Coffee color="#1C1C1E" size={20} />,
  },
  {
    id: '2',
    title: 'Salary',
    category: 'Income',
    amount: '+₦4,200.00',
    date: 'Yesterday, 10:00 AM',
    type: 'credit',
    icon: <ArrowDownLeft color="#1C1C1E" size={20} />,
  },
  {
    id: '3',
    title: 'Apple Store',
    category: 'Electronics',
    amount: '-₦999.00',
    date: 'Jun 28, 04:30 PM',
    type: 'debit',
    icon: <ShoppingBag color="#1C1C1E" size={20} />,
  },
  {
    id: '4',
    title: 'Transfer to John',
    category: 'Sent',
    amount: '-₦150.00',
    date: 'Jun 25, 08:15 PM',
    type: 'debit',
    icon: <ArrowUpRight color="#1C1C1E" size={20} />,
  },
];

export function RecentTransactions() {
  return (
    <View style={{ paddingBottom: 100 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text font={{ family: 'PlayfairDisplay', weight: 'Bold' }} style={{ fontSize: 20, color: '#1C1C1E' }}>
          Recent activity
        </Text>
        <Text font={{ family: 'SourceSans3', weight: 'SemiBold' }} style={{ fontSize: 14, color: '#7A7A7A' }}>
          See all
        </Text>
      </View>

      <View style={{ gap: 20 }}>
        {TRANSACTIONS.map((tx) => (
          <View key={tx.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {tx.icon}
              </View>
              <View>
                <Text font={{ family: 'SourceSans3', weight: 'SemiBold' }} style={{ fontSize: 16, color: '#1C1C1E', marginBottom: 4 }}>
                  {tx.title}
                </Text>
                <Text font={{ family: 'SourceSans3' }} style={{ fontSize: 13, color: '#7A7A7A' }}>
                  {tx.date}
                </Text>
              </View>
            </View>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ fontSize: 16, color: tx.type === 'credit' ? '#34C759' : '#1C1C1E' }}
            >
              {tx.amount}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
