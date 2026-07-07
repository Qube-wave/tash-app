<<<<<<< HEAD
import { ApiRequestError, completeOnboardingProfile } from '@/apis';
import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { AuthTextInput } from '@/components/modules/auth/auth-text-input';
import { Text } from '@/components/ui/text';
import { useOnboarding } from '@/providers/onboarding-provider';
=======
import { AuthScreenLayout } from '@/components/modules/auth/auth-screen-layout';
import { AuthTextInput } from '@/components/modules/auth/auth-text-input';
>>>>>>> 4edcff91cf02b0ccc5857354ab155381f28cc28e
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return 'Unable to save your profile. Please try again.';
}

function normalizeDateOfBirth(value: string) {
  return value.replace(/[^0-9-]/g, '').slice(0, 10);
}

function isDateOfBirthValid(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default function PersonalInfoScreen() {
  const router = useRouter();
<<<<<<< HEAD
  const { onboardingSessionToken, profileDraft, setProfileDraft, setStep } = useOnboarding();
  const [firstName, setFirstName] = useState(profileDraft?.firstName ?? '');
  const [lastName, setLastName] = useState(profileDraft?.lastName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(profileDraft?.dateOfBirth ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!onboardingSessionToken) {
      router.replace('/(auth)/create-account/phone');
    }
  }, [onboardingSessionToken, router]);

  const canContinue =
    Boolean(firstName.trim()) && Boolean(lastName.trim()) && isDateOfBirthValid(dateOfBirth);

  const handleContinue = async () => {
    if (!onboardingSessionToken || !canContinue || isSubmitting) {
      return;
    }

    const nextProfileDraft = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
    };

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await completeOnboardingProfile({
        onboardingSessionToken,
        ...nextProfileDraft,
      });
      setProfileDraft(nextProfileDraft);
      setStep(response.currentStep, response.user);
      router.push('/(auth)/create-account/bvn');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };
=======
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bvn, setBvn] = useState('');
>>>>>>> 4edcff91cf02b0ccc5857354ab155381f28cc28e

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreenLayout
<<<<<<< HEAD
        heading="Tell us about you"
        subtitle="Enter your legal details as they appear on your ID."
        continueLabel={isSubmitting ? 'Saving...' : 'Continue'}
        onContinue={handleContinue}
        continueDisabled={!canContinue || isSubmitting}
      >
=======
        heading="A few details"
        subtitle="Enter your legal name and BVN so we can verify your identity."
        onContinue={() => router.push('/(auth)/create-account/pin-setup')}
        continueDisabled={!firstName.trim() || !lastName.trim() || bvn.length !== 11}>
>>>>>>> 4edcff91cf02b0ccc5857354ab155381f28cc28e
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <AuthTextInput
              style={{ flex: 1 }}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              autoCapitalize="words"
              autoComplete="given-name"
            />
            <AuthTextInput
              style={{ flex: 1 }}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              autoCapitalize="words"
              autoComplete="family-name"
            />
          </View>
          <AuthTextInput
<<<<<<< HEAD
            value={firstName}
            onChangeText={(value) => {
              setFirstName(value);
              setErrorMessage(null);
            }}
            placeholder="First name"
            autoCapitalize="words"
            autoComplete="given-name"
            editable={!isSubmitting}
          />
          <AuthTextInput
            value={lastName}
            onChangeText={(value) => {
              setLastName(value);
              setErrorMessage(null);
            }}
            placeholder="Last name"
            autoCapitalize="words"
            autoComplete="family-name"
            editable={!isSubmitting}
=======
            value={bvn}
            onChangeText={(text) => setBvn(text.replace(/[^0-9]/g, '').slice(0, 11))}
            placeholder="BVN (11 digits)"
            keyboardType="number-pad"
            maxLength={11}
>>>>>>> 4edcff91cf02b0ccc5857354ab155381f28cc28e
          />
          <AuthTextInput
            value={dateOfBirth}
            onChangeText={(value) => {
              setDateOfBirth(normalizeDateOfBirth(value));
              setErrorMessage(null);
            }}
            placeholder="Date of birth (YYYY-MM-DD)"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            editable={!isSubmitting}
          />
          {errorMessage ? (
            <Text
              font={{ family: 'SourceSans3', weight: 'Medium' }}
              style={{ color: '#C75A3A', fontSize: 14, lineHeight: 20 }}
            >
              {errorMessage}
            </Text>
          ) : null}
        </View>
      </AuthScreenLayout>
    </>
  );
}
