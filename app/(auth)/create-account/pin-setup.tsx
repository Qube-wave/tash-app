import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { PinInput } from '@/components/modules/auth/pin-input';
import { Stack, useRouter } from 'expo-router';

export default function PinSetupScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="Create a PIN"
        subtitle="You'll use this PIN to authorize transactions."
        showContinue={false}
      >
        <PinInput
          onComplete={(_pin) => {
            router.push('/(app)/(tabs)');
          }}
        />
      </AuthScreenLayout>
    </>
  );
}
