import { Text } from '@/components/ui/text';
import { resolveFontFamily } from '@/constants/fonts';
import * as React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  phoneNumber: string;
  onChangePhoneNumber: (value: string) => void;
  countryCode?: string;
  countryFlag?: string;
};

export function PhoneInput({
  phoneNumber,
  onChangePhoneNumber,
  countryCode = '+234',
  countryFlag = '🇳🇬',
}: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Pressable
        style={{
          height: 54,
          backgroundColor: '#F0EEEA',
          borderRadius: 16,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Text style={{ fontSize: 20 }}>{countryFlag}</Text>
        <Text
          font={{ family: 'SourceSans3', weight: 'Medium' }}
          style={{ fontSize: 16, color: '#1C1C1E' }}
        >
          {countryCode}
        </Text>
        <Svg width={12} height={12} viewBox="0 0 12 12">
          <Path
            d="M3 4.5l3 3 3-3"
            stroke="#7A7A7A"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>

      <TextInput
        value={phoneNumber}
        onChangeText={onChangePhoneNumber}
        placeholder="801 234 5678"
        placeholderTextColor="#A0A0A0"
        keyboardType="phone-pad"
        selectionColor="#1C1C1E"
        style={{
          flex: 1,
          height: 54,
          backgroundColor: '#F0EEEA',
          borderRadius: 16,
          paddingHorizontal: 18,
          fontSize: 16,
          color: '#1C1C1E',
          fontFamily: resolveFontFamily('SourceSans3', 'Regular'),
        }}
      />
    </View>
  );
}
