import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { resolveFontFamily } from '@/constants/fonts';

export function AuthTextInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#A0A0A0"
      selectionColor="#1C1C1E"
      {...props}
      style={[
        {
          height: 54,
          backgroundColor: '#F0EEEA',
          borderRadius: 16,
          paddingHorizontal: 18,
          fontSize: 16,
          color: '#1C1C1E',
          fontFamily: resolveFontFamily('SourceSans3', 'Regular'),
        },
        props.style,
      ]}
    />
  );
}
