import type { ApiErrorEnvelope, ApiEnvelope } from './types';

type AccessTokenProvider = () => Promise<string | null> | string | null;
type RefreshAccessTokenProvider = () => Promise<string | null>;

type ApiClientOptions = {
  baseUrl?: string;
  getAccessToken?: AccessTokenProvider;
  refreshAccessToken?: RefreshAccessTokenProvider;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string;
  idempotencyKey?: string;
  signal?: AbortSignal;
  skipAuthRefresh?: boolean;
};

const PRODUCTION_API_BASE_URL = 'https://api.usetash.app/';
const RAW_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? PRODUCTION_API_BASE_URL;

function isProductionBundle() {
  return typeof __DEV__ !== 'undefined' ? !__DEV__ : process.env.NODE_ENV === 'production';
}

function isLocalOrPrivateApiUrl(baseUrl: string) {
  try {
    const url = new URL(baseUrl);
    const hostname = url.hostname.toLowerCase();

    return (
      url.protocol !== 'https:' ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch {
    return true;
  }
}

const API_BASE_URL =
  isProductionBundle() && isLocalOrPrivateApiUrl(RAW_API_BASE_URL)
    ? PRODUCTION_API_BASE_URL
    : RAW_API_BASE_URL;

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

function isUnauthorized(response: Response, payload: unknown) {
  if (response.status === 401) {
    return true;
  }

  return (
    isApiErrorEnvelope(payload) &&
    ['UNAUTHORIZED', 'TOKEN_EXPIRED', 'ACCESS_TOKEN_EXPIRED', 'INVALID_ACCESS_TOKEN'].includes(
      payload.error.code
    )
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
  private refreshAccessToken: RefreshAccessTokenProvider | null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? API_BASE_URL;
    this.getAccessToken = options.getAccessToken ?? null;
    this.refreshAccessToken = options.refreshAccessToken ?? null;
  }

  setAccessTokenProvider(getAccessToken: AccessTokenProvider | null) {
    this.getAccessToken = getAccessToken;
  }

  setRefreshAccessTokenProvider(refreshAccessToken: RefreshAccessTokenProvider | null) {
    this.refreshAccessToken = refreshAccessToken;
  }

  private async getFreshAccessToken() {
    if (!this.refreshAccessToken) {
      return null;
    }

    this.refreshPromise ??= this.refreshAccessToken().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async fetchRequest<T>(path: string, options: RequestOptions, accessToken: string | null) {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

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
    return { response, payload };
  }

  private createRequestError(response: Response, payload: unknown) {
    if (isApiErrorEnvelope(payload)) {
      return new ApiRequestError({
        code: payload.error.code,
        message: payload.error.message,
        details: payload.error.details,
        requestId: payload.requestId,
        status: response.status,
      });
    }

    return new ApiRequestError({
      code: `HTTP_${response.status}`,
      message: response.statusText || 'Request failed.',
      details: payload,
      requestId: null,
      status: response.status,
    });
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const accessToken =
      options.accessToken ?? (this.getAccessToken ? await this.getAccessToken() : null);
    const firstResult = await this.fetchRequest<T>(path, options, accessToken);

    if (
      !options.skipAuthRefresh &&
      isUnauthorized(firstResult.response, firstResult.payload) &&
      this.refreshAccessToken
    ) {
      const freshAccessToken = await this.getFreshAccessToken();

      if (freshAccessToken) {
        const retryResult = await this.fetchRequest<T>(path, options, freshAccessToken);

        if (isApiErrorEnvelope(retryResult.payload) || !retryResult.response.ok) {
          throw this.createRequestError(retryResult.response, retryResult.payload);
        }

        if (
          typeof retryResult.payload === 'object' &&
          retryResult.payload !== null &&
          'success' in retryResult.payload &&
          (retryResult.payload as { success: unknown }).success === true
        ) {
          return (retryResult.payload as unknown as { data: T }).data;
        }

        return retryResult.payload as T;
      }
    }

    if (isApiErrorEnvelope(firstResult.payload) || !firstResult.response.ok) {
      throw this.createRequestError(firstResult.response, firstResult.payload);
    }

    if (
      typeof firstResult.payload === 'object' &&
      firstResult.payload !== null &&
      'success' in firstResult.payload &&
      (firstResult.payload as { success: unknown }).success === true
    ) {
      return (firstResult.payload as unknown as { data: T }).data;
    }

    return firstResult.payload as T;
  }
}

export const apiClient = new ApiClient();
