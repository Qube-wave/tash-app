import { Text } from '@/components/ui/text';
import { Bell } from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';

export function DashboardHeader() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?u=timi' }}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8E5E0' }}
        />
        <View>
          <Text font={{ family: 'SourceSans3' }} style={{ fontSize: 14, color: '#7A7A7A' }}>
            Good morning,
          </Text>
          <Text font={{ family: 'PlayfairDisplay', weight: 'Bold' }} style={{ fontSize: 20, color: '#1C1C1E' }}>
            Timi
          </Text>
        </View>
      </View>

      <Pressable
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#E8E5E0',
        }}
      >
        <Bell color="#1C1C1E" size={20} />
      </Pressable>
    </View>
  );
}
