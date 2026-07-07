import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { resolveFontFamily } from '@/constants/fonts';
import { useColors } from '@/lib/use-colors';

export function AuthTextInput(props: TextInputProps) {
  const colors = useColors();
  return (
    <TextInput
      placeholderTextColor={colors.placeholder}
      selectionColor={colors.accent}
      {...props}
      style={[
        {
          height: 56,
          backgroundColor: colors.surface,
          borderRadius: 8,
          paddingHorizontal: 18,
          fontSize: 16,
          color: colors.heading,
          fontFamily: resolveFontFamily('SourceSans3', 'Regular'),
        },
        props.style,
      ]}
    />
  );
}
