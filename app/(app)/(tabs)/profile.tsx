import { Text } from '@/components/ui/text';
import { useColors } from '@/lib/use-colors';
import { Bell, ChevronRight, CreditCard, LogOut, ShieldCheck, UserCog } from 'lucide-react-native';
import * as React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ITEMS = [
  { icon: UserCog, label: 'Account details' },
  { icon: ShieldCheck, label: 'Security & PIN' },
  { icon: CreditCard, label: 'Cards & limits' },
  { icon: Bell, label: 'Notifications' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 22,
          paddingBottom: 24,
        }}>
        <Text
          font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
          style={{ fontSize: 26, color: colors.heading, letterSpacing: -0.3 }}>
          Profile
        </Text>

        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/160?img=68' }}
            style={{ width: 84, height: 84, borderRadius: 42 }}
          />
          <Text
            font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
            style={{ fontSize: 20, color: colors.heading, marginTop: 12 }}>
            Timi Leyin
          </Text>
          <Text font={{ family: 'SourceSans3' }} style={{ fontSize: 14, color: colors.subtitle }}>
            timi@ping.app
          </Text>
        </View>

        <View
          style={{
            marginTop: 26,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18,
            overflow: 'hidden',
          }}>
          {ITEMS.map((it, i) => {
            const Icon = it.icon;
            return (
              <Pressable
                key={it.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}>
                <Icon color={colors.heading} size={20} />
                <Text
                  font={{ family: 'SourceSans3', weight: 'Medium' }}
                  style={{ flex: 1, marginLeft: 14, fontSize: 15, color: colors.heading }}>
                  {it.label}
                </Text>
                <ChevronRight color={colors.placeholder} size={18} />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 22,
            height: 52,
            borderRadius: 2,
            borderWidth: 1.5,
            borderColor: colors.border,
          }}>
          <LogOut color={colors.accent} size={18} />
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ fontSize: 15, color: colors.accent }}>
            Log out
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
