import { apiClient, type ApiClient } from './client';
import type {
  AuthResponse,
  MessageResponse,
  OnboardingStepResponse,
  PublicUserProfile,
  RequestOptions,
  VerificationResponse,
} from './types';

const client = (api?: ApiClient) => api ?? apiClient;

export function sendSignupEmailVerification(
  payload: { email: string },
  api?: ApiClient
): Promise<MessageResponse> {
  return client(api).request('/api/v1/auth/send-email-verification', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function sendSignupPhoneVerification(
  payload: { phoneNumber: string },
  api?: ApiClient
): Promise<MessageResponse> {
  return client(api).request('/api/v1/auth/send-phone-verification', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function completeSignupEmailVerification(
  payload: { email: string; token: string },
  api?: ApiClient
): Promise<VerificationResponse> {
  return client(api).request('/api/v1/auth/complete-email-verification', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function completeSignupPhoneVerification(
  payload: { phoneNumber: string; token: string },
  api?: ApiClient
): Promise<VerificationResponse> {
  return client(api).request('/api/v1/auth/complete-phone-verification', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function sendLoginEmailVerification(
  payload: { email: string },
  api?: ApiClient
): Promise<MessageResponse> {
  return client(api).request('/api/v1/auth/login/email/send-verification', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function sendLoginPhoneVerification(
  payload: { phoneNumber: string },
  api?: ApiClient
): Promise<MessageResponse> {
  return client(api).request('/api/v1/auth/login/phone/send-verification', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function completeLoginEmailVerification(
  payload: { email: string; token: string },
  api?: ApiClient
): Promise<AuthResponse> {
  return client(api).request('/api/v1/auth/login/email/complete-verification', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function completeLoginPhoneVerification(
  payload: { phoneNumber: string; token: string },
  api?: ApiClient
): Promise<AuthResponse> {
  return client(api).request('/api/v1/auth/login/phone/complete-verification', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function sendCurrentUserEmailVerification(
  payload: { email: string },
  options?: RequestOptions,
  api?: ApiClient
): Promise<MessageResponse> {
  return client(api).request('/api/v1/auth/me/email/send-verification', {
    method: 'POST',
    body: payload,
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function completeCurrentUserEmailVerification(
  payload: { email: string; token: string },
  options?: RequestOptions,
  api?: ApiClient
): Promise<PublicUserProfile> {
  return client(api).request('/api/v1/auth/me/email/complete-verification', {
    method: 'POST',
    body: payload,
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function sendCurrentUserPhoneVerification(
  payload: { phoneNumber: string },
  options?: RequestOptions,
  api?: ApiClient
): Promise<MessageResponse> {
  return client(api).request('/api/v1/auth/me/phone/send-verification', {
    method: 'POST',
    body: payload,
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function completeCurrentUserPhoneVerification(
  payload: { phoneNumber: string; token: string },
  options?: RequestOptions,
  api?: ApiClient
): Promise<PublicUserProfile> {
  return client(api).request('/api/v1/auth/me/phone/complete-verification', {
    method: 'POST',
    body: payload,
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function completeOnboardingProfile(
  payload: {
    onboardingSessionToken: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  },
  api?: ApiClient
): Promise<OnboardingStepResponse> {
  return client(api).request('/api/v1/auth/onboarding/profile', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function claimPaymentTag(
  payload: { onboardingSessionToken: string; paymentTag: string },
  api?: ApiClient
): Promise<OnboardingStepResponse> {
  return client(api).request('/api/v1/auth/onboarding/tag', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function completeOnboardingPin(
  payload: { onboardingSessionToken: string; pin: string },
  api?: ApiClient
): Promise<AuthResponse> {
  return client(api).request('/api/v1/auth/onboarding/pin', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function refreshSession(
  payload: { refreshToken: string },
  api?: ApiClient
): Promise<AuthResponse> {
  return client(api).request('/api/v1/auth/refresh', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function unlockSession(
  payload: { refreshToken: string; pin: string },
  api?: ApiClient
): Promise<AuthResponse> {
  return client(api).request('/api/v1/auth/unlock', {
    skipAuthRefresh: true,
    method: 'POST',
    body: payload,
  });
}

export function logoutCurrentDevice(
  payload: { refreshToken: string },
  options?: RequestOptions,
  api?: ApiClient
): Promise<MessageResponse> {
  return client(api).request('/api/v1/auth/logout', {
    method: 'POST',
    body: payload,
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function logoutAllDevices(
  options?: RequestOptions,
  api?: ApiClient
): Promise<MessageResponse> {
  return client(api).request('/api/v1/auth/logout-all', {
    method: 'POST',
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}
