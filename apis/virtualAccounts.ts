import { apiClient, type ApiClient } from './client';
import type {
  RequestOptions,
  VirtualAccount,
  VirtualAccountPurpose,
  VirtualAccountType,
} from './types';

const client = (api?: ApiClient) => api ?? apiClient;

export function createVirtualAccount(
  payload: {
    walletUuid: string;
    type: VirtualAccountType;
    purpose: VirtualAccountPurpose;
  },
  options?: RequestOptions,
  api?: ApiClient
): Promise<VirtualAccount> {
  return client(api).request('/api/v1/virtual-accounts', {
    method: 'POST',
    body: payload,
    accessToken: options?.accessToken,
    idempotencyKey: options?.idempotencyKey,
    signal: options?.signal,
  });
}

export function listVirtualAccounts(
  options?: RequestOptions,
  api?: ApiClient
): Promise<VirtualAccount[]> {
  return client(api).request('/api/v1/virtual-accounts', {
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function getVirtualAccount(
  uuid: string,
  options?: RequestOptions,
  api?: ApiClient
): Promise<VirtualAccount> {
  return client(api).request(`/api/v1/virtual-accounts/${encodeURIComponent(uuid)}`, {
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function disableVirtualAccount(
  uuid: string,
  options?: RequestOptions,
  api?: ApiClient
): Promise<VirtualAccount> {
  return client(api).request(`/api/v1/virtual-accounts/${encodeURIComponent(uuid)}/disable`, {
    method: 'POST',
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}
