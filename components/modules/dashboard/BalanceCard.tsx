import { Text } from '@/components/ui/text';
import { MoreHorizontal, Plus, Send } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type ActionButtonProps = {
  icon: React.ReactNode;
  label: string;
};

function ActionButton({ icon, label }: ActionButtonProps) {
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Pressable
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Pressable>
      <Text font={{ family: 'SourceSans3' }} style={{ fontSize: 13, color: '#E8E5E0' }}>
        {label}
      </Text>
    </View>
  );
}

export function BalanceCard() {
  return (
    <View
      style={{
        backgroundColor: '#1C1C1E',
        borderRadius: 28,
        padding: 24,
        marginBottom: 32,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <View>
          <Text font={{ family: 'SourceSans3' }} style={{ fontSize: 15, color: '#A0A0A0', marginBottom: 8 }}>
            Total Balance
          </Text>
          <Text font={{ family: 'PlayfairDisplay', weight: 'Bold' }} style={{ fontSize: 36, color: '#FFFFFF', letterSpacing: -1, paddingBottom: 4, lineHeight: 44 }}>
            ₦12,450.00
          </Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
          <Text font={{ family: 'SourceSans3', weight: 'SemiBold' }} style={{ fontSize: 13, color: '#FFFFFF' }}>
            NGN
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8 }}>
        <ActionButton icon={<Plus color="#FFFFFF" size={24} />} label="Add money" />
        <ActionButton icon={<Send color="#FFFFFF" size={24} />} label="Transfer" />
        <ActionButton icon={<MoreHorizontal color="#FFFFFF" size={24} />} label="More" />
      </View>
    </View>
  );
}
