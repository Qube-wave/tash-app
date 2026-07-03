import { Text } from '@/components/ui/text';
import { CardStack } from '@/components/modules/onboarding/CardStack';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const SCREEN_OPTIONS = {
  headerShown: false,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AnimatedButton({
  label,
  variant,
  onPress,
}: {
  label: string;
  variant: 'outline' | 'filled';
  onPress?: () => void;
}) {
  const scale = useSharedValue(1);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isFilled = variant === 'filled';

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      }}
      onPress={onPress}
      style={[
        {
          height: 54,
          borderRadius: 27,
          backgroundColor: isFilled ? '#1C1C1E' : '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          ...(isFilled
            ? {}
            : { borderWidth: 1, borderColor: '#E8E5E0' }),
        },
        containerStyle,
      ]}
    >
      <Text
        font={{ family: 'SourceSans3', weight: 'SemiBold' }}
        style={{ fontSize: 16, color: isFilled ? '#FFFFFF' : '#1C1C1E' }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#F5F2ED',
          paddingHorizontal: 24,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 8,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ gap: 12 }}>
          <View>
            <Text
              font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
              style={{ fontSize: 34, lineHeight: 40, color: '#1C1C1E', letterSpacing: -0.5 }}
            >
              Easy to pay at home{'\n'}and away
            </Text>
          </View>
          <View>
            <Text
              font={{ family: 'SourceSans3' }}
              style={{ fontSize: 15, lineHeight: 21, color: '#7A7A7A' }}
            >
              Some cards available on paid plans or in{'\n'}certain countries only.
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', gap: 16 }}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
            <View
              style={{
                width: 24,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#1C1C1E',
              }}
            />
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#C5C5C5',
              }}
            />
          </View>

          <CardStack />
        </View>

        <View style={{ gap: 10 }}>
          <AnimatedButton label="Create account" variant="outline" onPress={() => router.push('/(auth)/create-account/phone')} />
          <AnimatedButton label="Sign in" variant="filled" onPress={() => router.push('/(auth)/login/email')} />
        </View>
      </View>
    </>
  );
}
