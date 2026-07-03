import { AuthScreenLayout } from '@/components/modules/auth/AuthScreenLayout';
import { PhoneInput } from '@/components/modules/auth/PhoneInput';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

export default function PhoneScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="What's your number?"
        subtitle={"We'll send you a verification code\nto create your account at Finuvo."}
        onContinue={() => router.push('/(auth)/create-account/email')}
        continueDisabled={phoneNumber.length < 10}
      >
        <PhoneInput phoneNumber={phoneNumber} onChangePhoneNumber={setPhoneNumber} />
      </AuthScreenLayout>
    </>
  );
}
