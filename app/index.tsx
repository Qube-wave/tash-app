import { OnboardingCarousel } from '@/components/modules/onboarding/onboarding-carousel';
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

  return <OnboardingCarousel />;
}
