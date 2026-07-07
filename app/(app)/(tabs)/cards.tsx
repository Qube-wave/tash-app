import { BankCard } from '@/components/modules/dashboard/bank-card';
import { Text } from '@/components/ui/text';
import { useColors } from '@/lib/use-colors';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { Image, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CARDS = [
  { name: 'Timileyin Oyelekan', from: '#C75A3A', to: '#7E2E17' },
  { name: 'Timileyin Oyelekan', from: '#3A3A44', to: '#111114' },
  { name: 'Timileyin Oyelekan', from: '#2E7D5B', to: '#12402C' },
];

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { width } = useWindowDimensions();

  const cardWidth = Math.min(width * 0.6, 250);
  const gap = 40;
  const sidePad = (width - cardWidth) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 8, flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 22,
          }}>
          <Text
            font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
            style={{ fontSize: 26, color: colors.heading, letterSpacing: -0.3 }}>
            Cards
          </Text>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=68' }}
            style={{ width: 38, height: 38, borderRadius: 19 }}
          />
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + gap}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: sidePad, gap, alignItems: 'center' }}>
            {CARDS.map((c, i) => (
              <BankCard key={i} width={cardWidth} name={c.name} from={c.from} to={c.to} />
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 30, paddingBottom: insets.bottom + 16 }}>
          <Text style={{ textAlign: 'center', fontSize: 21, lineHeight: 30, color: colors.heading }}>
            <Text font={{ family: 'PlayfairDisplay' }} style={{ fontSize: 21, color: colors.heading }}>
              A safe, secure way to{' '}
            </Text>
            <Text
              font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
              style={{ fontSize: 21, color: colors.heading }}>
              manage your money
            </Text>
            <Text font={{ family: 'PlayfairDisplay' }} style={{ fontSize: 21, color: colors.heading }}>
              {' '}and{' '}
            </Text>
            <Text
              font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
              style={{ fontSize: 21, color: colors.heading }}>
              spend
            </Text>
            <Text font={{ family: 'PlayfairDisplay' }} style={{ fontSize: 21, color: colors.heading }}>
              {' '}without limits
            </Text>
          </Text>

          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={{
              marginTop: 26,
              height: 56,
              borderRadius: 2,
              backgroundColor: colors.button,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ fontSize: 17, color: colors.buttonText }}>
              Link Card
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
