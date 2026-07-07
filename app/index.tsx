import { Logo } from '@/components/ui/logo';
import { useSession } from '@/providers/session-provider';
import { Text } from '@/components/ui/text';
import { CardStack } from '@/components/modules/onboarding/CardStack';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
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
          backgroundColor: isFilled ? '#C75A3A' : '#FFF6EE',
          alignItems: 'center',
          justifyContent: 'center',
          ...(isFilled ? {} : { borderWidth: 1, borderColor: '#E8D6C8' }),
        },
        containerStyle,
      ]}>
      <Text
        font={{ family: 'Onest', weight: 'SemiBold' }}
        style={{ fontSize: 16, color: isFilled ? '#FFF6EE' : '#1F1714' }}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'locked') {
      router.replace('/(auth)/unlock');
    }

    if (status === 'authenticated') {
      router.replace('/(app)/(tabs)');
    }
  }, [router, status]);

  if (status === 'bootstrapping' || status === 'locked' || status === 'authenticated') {
    return null;
  }

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFF6EE',
          paddingHorizontal: 24,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 8,
          justifyContent: 'space-between',
        }}>
        <View style={{ gap: 12 }}>
          <Logo size={48} style={{ marginBottom: 4 }} />
          <View>
            <Text
              font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
              style={{ fontSize: 34, lineHeight: 40, color: '#1F1714', letterSpacing: -0.5 }}>
              Connect Once{'\n'}and pay anywhere
            </Text>
          </View>
          <View>
            <Text
              font={{ family: 'Onest' }}
              style={{ fontSize: 15, lineHeight: 21, color: '#A94E2C' }}>
              Connect your card or bank{'\n'} and experience seamless payment.
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', gap: 16 }}>
          {/*<View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
            <View
              style={{
                width: 24,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#C75A3A',
              }}
            />
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#E8D6C8',
              }}
            />
          </View>*/}

          <CardStack />
        </View>

        <View style={{ gap: 10 }}>
          <AnimatedButton
            label="Create account"
            variant="outline"
            onPress={() => router.push('/(auth)/create-account/phone')}
          />
          <AnimatedButton
            label="Sign in"
            variant="filled"
            onPress={() => router.push('/(auth)/login/email')}
          />
        </View>
      </View>
    </>
  );
}
