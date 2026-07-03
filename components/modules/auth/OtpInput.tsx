import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { resolveFontFamily } from '@/constants/fonts';

type Props = {
  length?: number;
  onComplete: (code: string) => void;
};

export function OtpInput({ length = 6, onComplete }: Props) {
  const [code, setCode] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const joined = newCode.join('');
    if (joined.length === length && !newCode.includes('')) {
      onComplete(joined);
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 400);
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectionColor="#1C1C1E"
          style={{
            width: 48,
            height: 56,
            backgroundColor: digit ? '#E8E5E0' : '#F0EEEA',
            borderRadius: 14,
            textAlign: 'center',
            fontSize: 22,
            color: '#1C1C1E',
            fontFamily: resolveFontFamily('SourceSans3', 'SemiBold'),
          }}
        />
      ))}
    </View>
  );
}
