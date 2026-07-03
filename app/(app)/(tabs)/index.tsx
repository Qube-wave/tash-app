import { BalanceCard } from '@/components/modules/dashboard/BalanceCard';
import { DashboardHeader } from '@/components/modules/dashboard/DashboardHeader';
import { QuickSend } from '@/components/modules/dashboard/QuickSend';
import { RecentTransactions } from '@/components/modules/dashboard/RecentTransactions';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardHome() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F2ED' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
        }}
      >
        <DashboardHeader />
        <BalanceCard />
        <QuickSend />
        <RecentTransactions />
      </ScrollView>
    </View>
  );
}
