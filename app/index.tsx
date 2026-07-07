import { OnboardingCarousel } from '@/components/modules/onboarding/onboarding-carousel';
<<<<<<< HEAD
import { useSession } from '@/providers/session-provider';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function OnboardingScreen() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'locked') {
      router.replace('/(auth)/unlock');
    }

    if (status === 'authenticated') {
      router.replace('/(app)/(tabs)');
    }
  }, [router, status]);

  if (status === 'bootstrapping' || status === 'locked' || status === 'authenticated') {
    return null;
  }

=======

export default function OnboardingScreen() {
>>>>>>> 4edcff91cf02b0ccc5857354ab155381f28cc28e
  return <OnboardingCarousel />;
}
