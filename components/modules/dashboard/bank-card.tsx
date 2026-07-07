import { GradientFill } from '@/components/shared/gradient';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

type Props = {
  width: number;
  name?: string;
  from?: string;
  to?: string;
};

function Chip() {
  return (
    <Svg width={40} height={30} viewBox="0 0 40 30">
      <Rect x={0} y={0} width={40} height={30} rx={6} fill="#E7B85C" />
      <Rect x={0} y={9} width={40} height={2} fill="#C99B3E" />
      <Rect x={0} y={19} width={40} height={2} fill="#C99B3E" />
      <Rect x={13} y={0} width={2} height={30} fill="#C99B3E" />
      <Rect x={25} y={0} width={2} height={30} fill="#C99B3E" />
    </Svg>
  );
}

export function BankCard({
  width,
  name = 'Timileyin Oyelekan',
  from = '#C75A3A',
  to = '#7E2E17',
}: Props) {
  const height = width * 1.56;
  return (
    <View
      style={{
        width,
        height,
        borderRadius: 22,
        overflow: 'hidden',
        padding: 22,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
        elevation: 10,
      }}>
      <GradientFill from={from} to={to} />

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Chip />
      </View>

      <View style={{ gap: 14 }}>
        <Text
          font={{ family: 'SourceSans3', weight: 'SemiBold' }}
          style={{ color: 'rgba(255,255,255,0.92)', fontSize: 15, letterSpacing: 3 }}>
          {name.toUpperCase()}
        </Text>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Regular' }}
            style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, letterSpacing: 2 }}>
            •••• 4829
          </Text>
          <Text
            font={{ family: 'PlayfairDisplay', weight: 'Black', style: 'Italic' }}
            style={{ color: '#FFFFFF', fontSize: 26, letterSpacing: 1 }}>
            VISA
          </Text>
        </View>
      </View>
    </View>
  );
}
