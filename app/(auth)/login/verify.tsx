import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { OtpInput } from '@/components/modules/auth/otp-input';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function LoginVerifyScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="Enter the code"
        subtitle="We sent a verification code to your email address."
        showContinue={false}
      >
        <View style={{ gap: 32 }}>
          <OtpInput
            onComplete={(_code) => {
              router.push('/(app)/(tabs)');
            }}
          />
          <Pressable style={{ alignItems: 'center' }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ fontSize: 15, color: '#1C1C1E', textDecorationLine: 'underline' }}
            >
              Resend code
            </Text>
          </Pressable>
        </View>
      </AuthScreenLayout>
    </>
  );
}
