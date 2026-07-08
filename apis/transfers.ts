import { apiClient, type ApiClient } from './client';
import type {
  BankTransfer,
  RequestOptions,
  TashTransfer,
  TransferDetails,
  TransferFundingSource,
} from './types';

const client = (api?: ApiClient) => api ?? apiClient;

export function sendTashTransfer(
  payload: {
    recipient: string;
    walletUuid: string;
    amount: number;
    currency: string;
    description?: string;
    transactionPin: string;
    fundingSource: TransferFundingSource;
    cardUuid?: string;
    mandateUuid?: string;
  },
  options?: RequestOptions,
  api?: ApiClient
): Promise<TashTransfer> {
  return client(api).request('/api/v1/transfers/tash', {
    method: 'POST',
    body: payload,
    accessToken: options?.accessToken,
    idempotencyKey: options?.idempotencyKey,
    signal: options?.signal,
  });
}

export function sendBankTransfer(
  payload: {
    walletUuid: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    currency: string;
    description?: string;
    transactionPin: string;
    fundingSource: TransferFundingSource;
    cardUuid?: string;
    mandateUuid?: string;
  },
  options?: RequestOptions,
  api?: ApiClient
): Promise<BankTransfer> {
  return client(api).request('/api/v1/transfers/bank', {
    method: 'POST',
    body: payload,
    accessToken: options?.accessToken,
    idempotencyKey: options?.idempotencyKey,
    signal: options?.signal,
  });
}

export function getTransfer(
  reference: string,
  options?: RequestOptions,
  api?: ApiClient
): Promise<TransferDetails> {
  return client(api).request(`/api/v1/transfers/${encodeURIComponent(reference)}`, {
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}

export function requeryTransfer(
  reference: string,
  options?: RequestOptions,
  api?: ApiClient
): Promise<TransferDetails> {
  return client(api).request(`/api/v1/transfers/${encodeURIComponent(reference)}/requery`, {
    method: 'POST',
    accessToken: options?.accessToken,
    signal: options?.signal,
  });
}
