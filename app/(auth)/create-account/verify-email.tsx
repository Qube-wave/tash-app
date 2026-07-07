import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { OtpInput } from '@/components/modules/auth/otp-input';
import { Text } from '@/components/ui/text';
import { useColors } from '@/lib/use-colors';
import { Stack, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
        heading="Verify your email"
        subtitle="Enter the 6-digit code we sent to your email address."
        showContinue={false}
      >
        <View style={{ gap: 32 }}>
          <OtpInput onComplete={() => router.push('/(auth)/create-account/personal-info')} />
          <Pressable style={{ alignItems: 'center' }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ fontSize: 15, color: colors.accent }}
            >
              Resend code
            </Text>
          </Pressable>
        </View>
      </AuthScreenLayout>
    </>
  );
}
