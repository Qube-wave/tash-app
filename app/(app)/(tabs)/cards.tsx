import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export default function CardsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F2ED', alignItems: 'center', justifyContent: 'center' }}>
      <Text font={{ family: 'PlayfairDisplay', weight: 'Bold' }} style={{ fontSize: 24 }}>
        Cards
      </Text>
    </View>
  );
}
