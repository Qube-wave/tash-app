import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { AuthTextInput } from '@/components/modules/auth/auth-text-input';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

export default function LoginEmailScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="Welcome back"
        subtitle="Enter your email address to sign in."
        continueLabel="Sign in"
        onContinue={() => router.push('/(auth)/login/verify')}
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
