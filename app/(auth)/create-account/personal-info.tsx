import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { AuthTextInput } from '@/components/modules/auth/auth-text-input';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bvn, setBvn] = useState('');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="A few details"
        subtitle="Enter your legal name and BVN so we can verify your identity."
        onContinue={() => router.push('/(auth)/create-account/pin-setup')}
        continueDisabled={!firstName.trim() || !lastName.trim() || bvn.length !== 11}>
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <AuthTextInput
              style={{ flex: 1 }}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              autoCapitalize="words"
              autoComplete="given-name"
            />
            <AuthTextInput
              style={{ flex: 1 }}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              autoCapitalize="words"
              autoComplete="family-name"
            />
          </View>
          <AuthTextInput
            value={bvn}
            onChangeText={(text) => setBvn(text.replace(/[^0-9]/g, '').slice(0, 11))}
            placeholder="BVN (11 digits)"
            keyboardType="number-pad"
            maxLength={11}
          />
        </View>
      </AuthScreenLayout>
    </>
  );
}
