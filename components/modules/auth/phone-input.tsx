import { Text } from '@/components/ui/text';
import { resolveFontFamily } from '@/constants/fonts';
import { useColors } from '@/lib/use-colors';
import * as React from 'react';
import { TextInput, View } from 'react-native';

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
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <View
        style={{
          height: 56,
          backgroundColor: colors.surface,
          borderRadius: 8,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <Text style={{ fontSize: 20 }}>{countryFlag}</Text>
        <Text
          font={{ family: 'SourceSans3', weight: 'Medium' }}
          style={{ fontSize: 16, color: colors.heading }}>
          {countryCode}
        </Text>
      </View>

      <TextInput
        value={phoneNumber}
        onChangeText={onChangePhoneNumber}
        placeholder="801 234 5678"
        placeholderTextColor={colors.placeholder}
        keyboardType="phone-pad"
        selectionColor={colors.accent}
        style={{
          flex: 1,
          height: 56,
          backgroundColor: colors.surface,
          borderRadius: 8,
          paddingHorizontal: 18,
          fontSize: 16,
          color: colors.heading,
          fontFamily: resolveFontFamily('SourceSans3', 'Regular'),
        }}
      />
    </View>
  );
}
