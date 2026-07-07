import type { OnboardingStep, PublicUserProfile } from '@/apis';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type SignupMethod = 'email' | 'phone';

type OnboardingContact =
  | { method: 'email'; email: string }
  | { method: 'phone'; phoneNumber: string };

type OnboardingProfileDraft = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
};

type OnboardingContextValue = {
  contact: OnboardingContact | null;
  currentStep: OnboardingStep | null;
  onboardingSessionToken: string | null;
  profileDraft: OnboardingProfileDraft | null;
  user: PublicUserProfile | null;
  clearOnboarding: () => void;
  setContact: (contact: OnboardingContact) => void;
  setProfileDraft: (profileDraft: OnboardingProfileDraft) => void;
  setStep: (currentStep: OnboardingStep, user?: PublicUserProfile | null) => void;
  setVerifiedSession: (payload: {
    contact: OnboardingContact;
    currentStep: OnboardingStep;
    onboardingSessionToken: string;
  }) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [contact, setContactState] = useState<OnboardingContact | null>(null);
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [onboardingSessionToken, setOnboardingSessionToken] = useState<string | null>(null);
  const [profileDraft, setProfileDraft] = useState<OnboardingProfileDraft | null>(null);
  const [user, setUser] = useState<PublicUserProfile | null>(null);

  const clearOnboarding = useCallback(() => {
    setContactState(null);
    setCurrentStep(null);
    setOnboardingSessionToken(null);
    setProfileDraft(null);
    setUser(null);
  }, []);

  const setContact = useCallback((nextContact: OnboardingContact) => {
    setContactState(nextContact);
  }, []);

  const setStep = useCallback((nextStep: OnboardingStep, nextUser?: PublicUserProfile | null) => {
    setCurrentStep(nextStep);

    if (nextUser !== undefined) {
      setUser(nextUser);
    }
  }, []);

  const setVerifiedSession = useCallback(
    ({ contact: nextContact, currentStep: nextStep, onboardingSessionToken: nextToken }: {
      contact: OnboardingContact;
      currentStep: OnboardingStep;
      onboardingSessionToken: string;
    }) => {
      setContactState(nextContact);
      setCurrentStep(nextStep);
      setOnboardingSessionToken(nextToken);
    },
    [],
  );

  const value = useMemo<OnboardingContextValue>(
    () => ({
      contact,
      currentStep,
      onboardingSessionToken,
      profileDraft,
      user,
      clearOnboarding,
      setContact,
      setProfileDraft,
      setStep,
      setVerifiedSession,
    }),
    [
      clearOnboarding,
      contact,
      currentStep,
      onboardingSessionToken,
      profileDraft,
      setContact,
      setStep,
      user,
    ],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider.');
  }

  return context;
}
