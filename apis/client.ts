import type { ApiErrorEnvelope, ApiEnvelope } from './types';

type AccessTokenProvider = () => Promise<string | null> | string | null;

type ApiClientOptions = {
  baseUrl?: string;
  getAccessToken?: AccessTokenProvider;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string;
  idempotencyKey?: string;
  signal?: AbortSignal;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

function joinUrl(baseUrl: string, path: string) {
  if (!baseUrl) {
    return path;
  }

  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

async function parseResponseBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as { success: unknown }).success === false
  );
}

export class ApiRequestError extends Error {
  code: string;
  details: unknown;
  requestId: string | null;
  status: number;

  constructor({
    code,
    message,
    details,
    requestId,
    status,
  }: {
    code: string;
    message: string;
    details: unknown;
    requestId: string | null;
    status: number;
  }) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    this.status = status;
  }
}

export class ApiClient {
  private baseUrl: string;
  private getAccessToken: AccessTokenProvider | null;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? API_BASE_URL;
    this.getAccessToken = options.getAccessToken ?? null;
  }

  setAccessTokenProvider(getAccessToken: AccessTokenProvider | null) {
    this.getAccessToken = getAccessToken;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const accessToken =
      options.accessToken ?? (this.getAccessToken ? await this.getAccessToken() : null);

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let response: Response;

    try {
      response = await fetch(joinUrl(this.baseUrl, path), {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal,
      });
    } catch (error) {
      throw new ApiRequestError({
        code: 'NETWORK_ERROR',
        message:
          'Unable to reach the Tash API. Check that the backend is running and reachable from this device.',
        details: error,
        requestId: null,
        status: 0,
      });
    }

    const payload = (await parseResponseBody(response)) as ApiEnvelope<T> | unknown;

    if (isApiErrorEnvelope(payload)) {
      throw new ApiRequestError({
        code: payload.error.code,
        message: payload.error.message,
        details: payload.error.details,
        requestId: payload.requestId,
        status: response.status,
      });
    }

    if (!response.ok) {
      throw new ApiRequestError({
        code: `HTTP_${response.status}`,
        message: response.statusText || 'Request failed.',
        details: payload,
        requestId: null,
        status: response.status,
      });
    }

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'success' in payload &&
      (payload as { success: unknown }).success === true
    ) {
      return (payload as unknown as { data: T }).data;
    }

    return payload as T;
  }
}

export const apiClient = new ApiClient();
