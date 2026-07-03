import { AuthScreenLayout } from '@/components/modules/auth/AuthScreenLayout';
import { AuthTextInput } from '@/components/modules/auth/AuthTextInput';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="What's your name?"
        subtitle="Enter your legal name as it appears on your ID."
        onContinue={() => router.push('/(auth)/create-account/bvn')}
        continueDisabled={!firstName.trim() || !lastName.trim()}
      >
        <View style={{ gap: 14 }}>
          <AuthTextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            autoCapitalize="words"
            autoComplete="given-name"
          />
          <AuthTextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            autoCapitalize="words"
            autoComplete="family-name"
          />
        </View>
      </AuthScreenLayout>
    </>
  );
}
