import { apiClient, type ApiClient } from './client';
import type { DirectDebitMandate, RequestOptions } from './types';

const client = (api?: ApiClient) => api ?? apiClient;

function shouldLogDirectDebitResponses() {
  return (globalThis as { __DEV__?: boolean }).__DEV__ === true;
}

function logDirectDebitResponse<T>(action: string, response: T) {
  if (shouldLogDirectDebitResponses()) {
    console.log(`[direct-debit] ${action} response`, response);
  }

  return response;
}

export async function createDirectDebitMandate(
  payload: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
    maximumAmount: number;
    currency: string;
  },
  options?: RequestOptions,
  api?: ApiClient
): Promise<DirectDebitMandate> {
  const response = await client(api).request<DirectDebitMandate>('/api/v1/direct-debit/mandates', {
    method: 'POST',
    body: payload,
    accessToken: options?.accessToken,
    signal: options?.signal,
  });

  return logDirectDebitResponse('create mandate', response);
}

export async function listDirectDebitMandates(
  options?: RequestOptions,
  api?: ApiClient
): Promise<DirectDebitMandate[]> {
  const response = await client(api).request<DirectDebitMandate[]>('/api/v1/direct-debit/mandates', {
    accessToken: options?.accessToken,
    signal: options?.signal,
  });

  return logDirectDebitResponse('list mandates', response);
}

export async function getDirectDebitMandate(
  uuid: string,
  options?: RequestOptions,
  api?: ApiClient
): Promise<DirectDebitMandate> {
  const response = await client(api).request<DirectDebitMandate>(
    `/api/v1/direct-debit/mandates/${encodeURIComponent(uuid)}`,
    {
      accessToken: options?.accessToken,
      signal: options?.signal,
    }
  );

  return logDirectDebitResponse('get mandate', response);
}

export async function authorizeDirectDebitMandate(
  uuid: string,
  payload?: { authorizationReference?: string },
  options?: RequestOptions,
  api?: ApiClient
): Promise<DirectDebitMandate> {
  const response = await client(api).request<DirectDebitMandate>(
    `/api/v1/direct-debit/mandates/${encodeURIComponent(uuid)}/authorize`,
    {
      method: 'POST',
      body: payload,
      accessToken: options?.accessToken,
      signal: options?.signal,
    }
  );

  return logDirectDebitResponse('authorize mandate', response);
}

export async function revokeDirectDebitMandate(
  uuid: string,
  payload?: { reason?: string },
  options?: RequestOptions,
  api?: ApiClient
): Promise<DirectDebitMandate> {
  const response = await client(api).request<DirectDebitMandate>(
    `/api/v1/direct-debit/mandates/${encodeURIComponent(uuid)}/revoke`,
    {
      method: 'POST',
      body: payload,
      accessToken: options?.accessToken,
      signal: options?.signal,
    }
  );

  return logDirectDebitResponse('revoke mandate', response);
}
