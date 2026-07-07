import { apiClient, type ApiClient } from './client';
import type { Card, CardRegistrationSession, DeletedResponse, RequestOptions } from './types';

const client = (api?: ApiClient) => api ?? apiClient;

export function createCardRegistrationSession(
  payload: { currency: string; email?: string },
  options?: RequestOptions,
  api?: ApiClient
): Promise<CardRegistrationSession> {
  return client(api).request('/api/v1/cards/registration-sessions', {
    method: 'POST',
    body: payload,
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function submitCardDetails(
  reference: string,
  payload: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardPin?: string;
    cardholderName?: string;
  },
  options?: RequestOptions,
  api?: ApiClient
): Promise<CardRegistrationSession> {
  return client(api).request(
    `/api/v1/cards/registration-sessions/${encodeURIComponent(reference)}/card`,
    {
      method: 'POST',
      body: payload,
      accessToken: options?.accessToken,
      signal: options?.signal,
    }
  );
}

export function submitCardOtp(
  reference: string,
  payload: { otp: string },
  options?: RequestOptions,
  api?: ApiClient
): Promise<Card> {
  return client(api).request(
    `/api/v1/cards/registration-sessions/${encodeURIComponent(reference)}/otp`,
    {
      method: 'POST',
      body: payload,
      accessToken: options?.accessToken,
      signal: options?.signal,
    }
  );
}

export function listCards(options?: RequestOptions, api?: ApiClient): Promise<Card[]> {
  return client(api).request('/api/v1/cards', {
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function getCard(uuid: string, options?: RequestOptions, api?: ApiClient): Promise<Card> {
  return client(api).request(`/api/v1/cards/${encodeURIComponent(uuid)}`, {
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function setDefaultCard(
  uuid: string,
  options?: RequestOptions,
  api?: ApiClient
): Promise<Card> {
  return client(api).request(`/api/v1/cards/${encodeURIComponent(uuid)}/default`, {
    method: 'PATCH',
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function disableCard(
  uuid: string,
  options?: RequestOptions,
  api?: ApiClient
): Promise<Card> {
  return client(api).request(`/api/v1/cards/${encodeURIComponent(uuid)}/disable`, {
    method: 'POST',
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function deleteCard(
  uuid: string,
  options?: RequestOptions,
  api?: ApiClient
): Promise<DeletedResponse> {
  return client(api).request(`/api/v1/cards/${encodeURIComponent(uuid)}`, {
    method: 'DELETE',
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}
