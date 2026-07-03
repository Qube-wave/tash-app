import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { useEffect } from 'react';

const CARD_WIDTH = 295;
const CARD_HEIGHT = 180;
const CARD_RADIUS = 16;

function MastercardLogo({ size = 32 }: { size?: number }) {
  const circleR = size / 2.6;
  return (
    <Svg width={size * 1.6} height={size} viewBox="0 0 52 32">
      <Circle cx={18} cy={16} r={circleR} fill="#EB001B" />
      <Circle cx={34} cy={16} r={circleR} fill="#F79E1B" />
    </Svg>
  );
}

function FinuvoLogo() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          backgroundColor: '#1C1C1E',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Path d="M3 2h8v2H5v2h5v2H5v4H3V2Z" fill="#FFFFFF" />
        </Svg>
      </View>
      <Text
        font={{ family: 'SourceSans3', weight: 'SemiBold' }}
        style={{ fontSize: 14, color: '#1C1C1E', letterSpacing: 0.3 }}
      >
        Finuvo
      </Text>
    </View>
  );
}

function ChipIcon() {
  return (
    <Svg width={36} height={28} viewBox="0 0 36 28">
      <Rect x={0} y={0} width={36} height={28} rx={5} fill="#C8964C" />
      <Rect x={0} y={8} width={36} height={2} fill="#B8863C" />
      <Rect x={0} y={18} width={36} height={2} fill="#B8863C" />
      <Rect x={12} y={0} width={2} height={28} fill="#B8863C" />
      <Rect x={22} y={0} width={2} height={28} fill="#B8863C" />
    </Svg>
  );
}

const SHADOW_SM = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
} as const;

const SHADOW_MD = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 6,
} as const;

const SHADOW_LG = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.15,
  shadowRadius: 24,
  elevation: 10,
} as const;

export function CardStack() {
  const backCardTranslateY = useSharedValue(30);
  const backCardRotate = useSharedValue(0);
  const backCardOpacity = useSharedValue(0);

  const midCardTranslateY = useSharedValue(30);
  const midCardRotate = useSharedValue(0);
  const midCardOpacity = useSharedValue(0);

  const frontCardTranslateY = useSharedValue(40);
  const frontCardScale = useSharedValue(0.95);
  const frontCardOpacity = useSharedValue(0);

  const floatY = useSharedValue(0);

  useEffect(() => {
    backCardOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    backCardTranslateY.value = withDelay(200, withSpring(0, { damping: 14, stiffness: 90 }));
    backCardRotate.value = withDelay(200, withSpring(-2, { damping: 14, stiffness: 90 }));

    midCardOpacity.value = withDelay(350, withTiming(1, { duration: 400 }));
    midCardTranslateY.value = withDelay(350, withSpring(0, { damping: 14, stiffness: 90 }));
    midCardRotate.value = withDelay(350, withSpring(-1, { damping: 14, stiffness: 90 }));

    frontCardOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    frontCardTranslateY.value = withDelay(500, withSpring(0, { damping: 14, stiffness: 90 }));
    frontCardScale.value = withDelay(500, withSpring(1, { damping: 14, stiffness: 90 }));

    floatY.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(4, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const backCardStyle = useAnimatedStyle(() => ({
    opacity: backCardOpacity.value,
    transform: [
      { translateY: backCardTranslateY.value + floatY.value },
      { rotate: `${backCardRotate.value}deg` },
    ],
  }));

  const midCardStyle = useAnimatedStyle(() => ({
    opacity: midCardOpacity.value,
    transform: [
      { translateY: midCardTranslateY.value + floatY.value * 0.7 },
      { rotate: `${midCardRotate.value}deg` },
    ],
  }));

  const frontCardStyle = useAnimatedStyle(() => ({
    opacity: frontCardOpacity.value,
    transform: [
      { translateY: frontCardTranslateY.value + floatY.value * 0.4 },
      { scale: frontCardScale.value },
    ],
  }));

  return (
    <View style={{ width: CARD_WIDTH + 30, height: CARD_HEIGHT + 60, alignItems: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 15,
            width: CARD_WIDTH - 20,
            height: CARD_HEIGHT - 20,
            backgroundColor: '#3BB896',
            borderRadius: CARD_RADIUS,
            zIndex: 1,
            ...SHADOW_SM,
          },
          backCardStyle,
        ]}
      />

      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 18,
            left: 8,
            width: CARD_WIDTH - 8,
            height: CARD_HEIGHT - 10,
            backgroundColor: '#F0D98C',
            borderRadius: CARD_RADIUS,
            zIndex: 2,
            paddingHorizontal: 20,
            paddingTop: 16,
            ...SHADOW_MD,
          },
          midCardStyle,
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <FinuvoLogo />
          <MastercardLogo size={26} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 40,
            left: 0,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            backgroundColor: '#B5DDE9',
            borderRadius: CARD_RADIUS,
            zIndex: 3,
            paddingHorizontal: 22,
            paddingTop: 18,
            paddingBottom: 18,
            justifyContent: 'space-between',
            ...SHADOW_LG,
          },
          frontCardStyle,
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <FinuvoLogo />
          <MastercardLogo size={28} />
        </View>

        <View>
          <Text
            font={{ family: 'SourceSans3' }}
            style={{ fontSize: 11, color: '#5A6B70', marginBottom: 2, letterSpacing: 0.3 }}
          >
            Cardholder Name
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Text
              font={{ family: 'PlayfairDisplay', weight: 'Medium' }}
              style={{ fontSize: 20, color: '#1C1C1E' }}
            >
              Arthur Taylor
            </Text>
            <ChipIcon />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
