import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { PhoneInput } from '@/components/modules/auth/phone-input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useColors } from '@/lib/use-colors';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

export default function PhoneScreen() {
  const router = useRouter();
  const colors = useColors();
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="What's your number?"
        subtitle={"We'll send you a verification code\nto get your account set up."}
        onContinue={() => router.push('/(auth)/create-account/email')}
        continueDisabled={phoneNumber.length < 10}
        footer={
          <Button variant="link" onPress={() => router.push('/(auth)/login/email')}>
            <Text font={{ family: 'SourceSans3' }} style={{ fontSize: 14, color: colors.subtitle }}>
              Already have an account?{' '}
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ color: colors.accent }}>
                Login
              </Text>
            </Text>
          </Button>
        }>
        <PhoneInput phoneNumber={phoneNumber} onChangePhoneNumber={setPhoneNumber} />
      </AuthScreenLayout>
    </>
  );
}
