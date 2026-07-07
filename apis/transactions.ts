import { apiClient, type ApiClient } from './client';
import type {
  RequestOptions,
  TransactionListFilters,
  TransactionListResponse,
  TransactionRecord,
} from './types';

const client = (api?: ApiClient) => api ?? apiClient;

function buildQuery(filters?: TransactionListFilters) {
  const params = new URLSearchParams();

  if (!filters) {
    return '';
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function listTransactions(
  filters?: TransactionListFilters,
  options?: RequestOptions,
  api?: ApiClient
): Promise<TransactionListResponse> {
  return client(api).request(`/api/v1/transactions${buildQuery(filters)}`, {
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function getTransaction(
  uuid: string,
  options?: RequestOptions,
  api?: ApiClient
): Promise<TransactionRecord> {
  return client(api).request(`/api/v1/transactions/${encodeURIComponent(uuid)}`, {
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function getTransactionByReference(
  reference: string,
  options?: RequestOptions,
  api?: ApiClient
): Promise<TransactionRecord> {
  return client(api).request(`/api/v1/transactions/reference/${encodeURIComponent(reference)}`, {
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}
