import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { AuthTextInput } from '@/components/modules/auth/auth-text-input';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

export default function EmailScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="What's your email?"
        subtitle="We'll use this to keep your account secure."
        onContinue={() => router.push('/(auth)/create-account/verify-email')}
        continueDisabled={!email.includes('@') || !email.includes('.')}
      >
        <AuthTextInput
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </AuthScreenLayout>
    </>
  );
}
