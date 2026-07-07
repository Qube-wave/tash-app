import { Text } from '@/components/ui/text';
import { useColors } from '@/lib/use-colors';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  heading: string;
  subtitle: string;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  showContinue?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export function AuthScreenLayout({
  heading,
  subtitle,
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  showContinue = true,
  footer,
  children,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(continueDisabled ? 0.4 : 1);

  useEffect(() => {
    buttonOpacity.value = withTiming(continueDisabled ? 0.4 : 1, { duration: 200 });
  }, [continueDisabled]);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 16,
      }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: -8,
              marginTop: 4,
            }}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18l-6-6 6-6"
                stroke={colors.heading}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>

          <View style={{ marginTop: 20 }}>
            <Text
              font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
              style={{ fontSize: 30, lineHeight: 38, color: colors.heading, letterSpacing: -0.4 }}>
              {heading}
            </Text>
          </View>

          <View style={{ marginTop: 10 }}>
            <Text
              font={{ family: 'SourceSans3' }}
              style={{ fontSize: 15, lineHeight: 22, color: colors.subtitle }}>
              {subtitle}
            </Text>
          </View>

          <View style={{ flex: 1, marginTop: 32 }}>{children}</View>
        </View>

        {showContinue && (
          <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
            <AnimatedPressable
              onPressIn={() => {
                if (!continueDisabled) {
                  buttonScale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
              }}
              onPress={() => {
                if (!continueDisabled && onContinue) {
                  onContinue();
                }
              }}
              style={[
                {
                  height: 56,
                  borderRadius: 2,
                  backgroundColor: colors.button,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                btnStyle,
              ]}>
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ fontSize: 17, color: colors.buttonText }}>
                {continueLabel}
              </Text>
            </AnimatedPressable>
          </View>
        )}

        {footer && <View style={{ paddingHorizontal: 24, paddingTop: 4 }}>{footer}</View>}
      </KeyboardAvoidingView>
    </View>
  );
}
