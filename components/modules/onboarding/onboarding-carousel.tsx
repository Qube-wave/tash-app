import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import LottieView, { type LottieViewProps } from 'lottie-react-native';
import { Colors, useColors } from '@/lib/use-colors';
import { Sparkle } from './illustrations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ILLUSTRATION_WIDTH = 200;
const ILLUSTRATION_HEIGHT = 200;

type Slide = {
  key: string;
  lottie: LottieViewProps['source'];
  accent: string;
  rest: string;
  emoji: string;
  subtitle: string;
};

const SLIDES: Slide[] = [
  {
    key: 'pay',
    lottie: require('@/assets/lottie/wallet.json'),
    accent: 'Connect Once',
    rest: '\n Spend Anywhere',
    emoji: '',
    subtitle: 'Handle every payment from one simple dashboard, in just a few taps.',
  },
  {
    key: 'ping',
    lottie: require('@/assets/lottie/bell.json'),
    accent: 'Stay pinged',
    rest: ' on every transaction',
    emoji: ' 🔔',
    subtitle: 'Get instant alerts the moment money moves, so nothing ever slips past you.',
  },
];

function Dot({
  index,
  scrollX,
  width,
  active,
  inactive,
}: {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
  active: string;
  inactive: string;
}) {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      width: interpolate(scrollX.value, input, [8, 22, 8], 'clamp'),
      backgroundColor: interpolateColor(scrollX.value, input, [inactive, active, inactive]),
    };
  });
  return <Animated.View style={[{ height: 8, borderRadius: 4, marginRight: 6 }, style]} />;
}

function OnboardingSlide({
  slide,
  width,
  colors,
}: {
  slide: Slide;
  width: number;
  colors: Colors;
}) {
  return (
    <View style={{ width, paddingHorizontal: 32 }}>
      <View style={{ height: ILLUSTRATION_HEIGHT }}>
        <View style={{ position: 'absolute', top: 6, left: ILLUSTRATION_WIDTH * 0.6 }}>
          <Sparkle size={20} color={colors.sparkle} />
        </View>
        <View style={{ position: 'absolute', top: 30, left: ILLUSTRATION_WIDTH * 0.84 }}>
          <Sparkle size={28} color={colors.sparkle} />
        </View>
        <LottieView
          source={slide.lottie}
          autoPlay
          loop
          style={{
            width: ILLUSTRATION_WIDTH,
            height: ILLUSTRATION_HEIGHT,
            transform: [{ translateX: -25 }],
          }}
        />
      </View>

      <View style={{ marginTop: 6 }}>
        <Text
          font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
          style={{ fontSize: 32, lineHeight: 42, color: colors.heading, letterSpacing: -0.4 }}>
          <Text
            font={{ family: 'PlayfairDisplay', weight: 'Bold', style: 'Italic' }}
            style={{ fontSize: 32, lineHeight: 42, color: colors.accent }}>
            {slide.accent}
          </Text>
          {slide.rest}
          {slide.emoji}
        </Text>

        <Text
          font={{ family: 'SourceSans3' }}
          style={{ fontSize: 16, lineHeight: 24, color: colors.subtitle, marginTop: 16 }}>
          {slide.subtitle}
        </Text>
      </View>
    </View>
  );
}

export function OnboardingCarousel() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const colors = useColors();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const [index, setIndex] = React.useState(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const isLast = index === SLIDES.length - 1;

  const goToAuth = () => router.push('/(auth)/create-account/phone');

  const goToLogin = () => router.push('/(auth)/login/email');

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      goToAuth();
      return;
    }
    scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
  };

  const buttonScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale.value }] }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          height: 44,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {SLIDES.map((s, i) => (
            <Dot
              key={s.key}
              index={i}
              scrollX={scrollX}
              width={width}
              active={colors.dotActive}
              inactive={colors.dotInactive}
            />
          ))}
        </View>

        <Pressable
          onPress={goToAuth}
          hitSlop={12}
          style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ fontSize: 16, color: colors.skip }}>
            Skip
          </Text>
        </Pressable>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: 'flex-start', paddingTop: 12 }}>
        {SLIDES.map((slide) => (
          <Animated.View key={slide.key} entering={FadeInDown.duration(500)}>
            <OnboardingSlide slide={slide} width={width} colors={colors} />
          </Animated.View>
        ))}
      </Animated.ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom, paddingTop: 8 }}>
        <AnimatedPressable
          onPressIn={() => {
            buttonScale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
          }}
          onPressOut={() => {
            buttonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
          }}
          onPress={handleNext}
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
            {isLast ? 'Get started' : 'Continue'}
          </Text>
        </AnimatedPressable>

        <Button variant="ghost" onPress={goToLogin} className="mt-2 h-11">
          <Text
            font={{ family: 'SourceSans3', weight: 'Medium' }}
            className="text-muted-foreground text-sm">
            Login Instead
          </Text>
        </Button>
      </View>
    </View>
  );
}
