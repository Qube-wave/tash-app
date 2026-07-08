import { Text } from '@/components/ui/text';
import { useColors } from '@/lib/use-colors';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

type Props = {
  length?: number;
  onComplete: (pin: string) => void;
};

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'delete'],
];

const KEY_SIZE = 86;
const KEY_GAP = 14;

export function PinInput({ length = 4, onComplete }: Props) {
  const colors = useColors();
  const [pin, setPin] = useState('');
  const dotScale = Array.from({ length }, () => useSharedValue(1));

  const handlePress = (digit: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (pin.length < length) {
      const newPin = pin + digit;
      setPin(newPin);

      dotScale[newPin.length - 1].value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );

      if (newPin.length === length) {
        setTimeout(() => onComplete(newPin), 200);
      }
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (pin.length > 0) {
      dotScale[pin.length - 1].value = withTiming(1, { duration: 150 });
      setPin(pin.slice(0, -1));
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18 }}>
        {Array.from({ length }).map((_, i) => {
          const style = useAnimatedStyle(() => ({
            transform: [{ scale: dotScale[i].value }],
          }));

          return (
            <Animated.View
              key={i}
              style={[
                {
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: i < pin.length ? colors.accent : colors.surfaceActive,
                },
                style,
              ]}
            />
          );
        })}
      </View>

      <View style={{ gap: KEY_GAP, marginTop: 44 }}>
        {KEYS.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: KEY_GAP,
            }}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={keyIndex} style={{ width: KEY_SIZE, height: KEY_SIZE }} />;
              }

              if (key === 'delete') {
                return (
                  <Pressable
                    key={keyIndex}
                    onPress={handleDelete}
                    hitSlop={8}
                    style={{
                      width: KEY_SIZE,
                      height: KEY_SIZE,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"
                        stroke={colors.heading}
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M18 9l-6 6M12 9l6 6"
                        stroke={colors.heading}
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={keyIndex}
                  onPress={() => handlePress(key)}
                  hitSlop={8}
                  style={({ pressed }) => ({
                    width: KEY_SIZE,
                    height: KEY_SIZE,
                    borderRadius: KEY_SIZE / 2,
                    backgroundColor: pressed ? colors.surfaceActive : colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}>
                  <Text
                    font={{ family: 'SourceSans3', weight: 'Medium' }}
                    style={{ fontSize: 28, color: colors.heading }}>
                    {key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
