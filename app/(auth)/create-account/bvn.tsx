import { AuthScreenLayout } from '@/components/modules/auth/AuthScreenLayout';
import { AuthTextInput } from '@/components/modules/auth/AuthTextInput';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

export default function BvnScreen() {
  const router = useRouter();
  const [bvn, setBvn] = useState('');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="Enter your BVN"
        subtitle={
          'Your Bank Verification Number helps us\nverify your identity. It\'s 11 digits long.'
        }
        onContinue={() => router.push('/(auth)/create-account/pin-setup')}
        continueDisabled={bvn.length !== 11}
      >
        <AuthTextInput
          value={bvn}
          onChangeText={(text) => setBvn(text.replace(/[^0-9]/g, '').slice(0, 11))}
          placeholder="12345678901"
          keyboardType="number-pad"
          maxLength={11}
        />
      </AuthScreenLayout>
    </>
  );
}
