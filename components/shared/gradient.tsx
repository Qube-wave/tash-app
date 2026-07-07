import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type Props = {
  from: string;
  to: string;
  /** diagonal (top-left -> bottom-right) by default */
  diagonal?: boolean;
  radius?: number;
};

let counter = 0;

export function GradientFill({ from, to, diagonal = true, radius = 0 }: Props) {
  const id = React.useMemo(() => `grad-${counter++}`, []);
  const [size, setSize] = React.useState({ w: 0, h: 0 });

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) =>
        setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
      }>
      {size.w > 0 && size.h > 0 && (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2={diagonal ? '1' : '0'} y2="1">
              <Stop offset="0" stopColor={from} />
              <Stop offset="1" stopColor={to} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={size.w} height={size.h} rx={radius} fill={`url(#${id})`} />
        </Svg>
      )}
    </View>
  );
}
