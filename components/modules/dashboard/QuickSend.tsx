import { Text } from '@/components/ui/text';
import { Plus } from 'lucide-react-native';
import { Image, ScrollView, View } from 'react-native';

const CONTACTS = [
  { id: '1', name: 'Sarah', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: '2', name: 'Mike', image: 'https://i.pravatar.cc/150?u=mike' },
  { id: '3', name: 'Emma', image: 'https://i.pravatar.cc/150?u=emma' },
  { id: '4', name: 'David', image: 'https://i.pravatar.cc/150?u=david' },
  { id: '5', name: 'Lisa', image: 'https://i.pravatar.cc/150?u=lisa' },
];

export function QuickSend() {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text font={{ family: 'PlayfairDisplay', weight: 'Bold' }} style={{ fontSize: 20, color: '#1C1C1E', marginBottom: 16 }}>
        Quick Send
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E8E5E0',
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus color="#1C1C1E" size={24} />
          </View>
          <Text font={{ family: 'SourceSans3' }} style={{ fontSize: 13, color: '#1C1C1E' }}>
            New
          </Text>
        </View>

        {CONTACTS.map((contact) => (
          <View key={contact.id} style={{ alignItems: 'center', gap: 8 }}>
            <Image
              source={{ uri: contact.image }}
              style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#E8E5E0' }}
            />
            <Text font={{ family: 'SourceSans3' }} style={{ fontSize: 13, color: '#7A7A7A' }}>
              {contact.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
