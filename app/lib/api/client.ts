export type ApiPrimitive = string | number | boolean;

export type ApiQueryValue =
  | ApiPrimitive
  | null
  | undefined
  | readonly ApiPrimitive[];

export type ApiQuery = Record<string, ApiQueryValue>;

export type ApiEnvelope<T> = {
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
};

export type ApiErrorPayload = {
  message?: string;
  code?: string;
  details?: unknown;
  requestId?: string;
  error?:
    | string
    | {
        message?: string;
        code?: string;
        details?: unknown;
      };
};

export type ApiRequestOptions<TBody = unknown> = Omit<
  RequestInit,
  "body" | "credentials" | "headers" | "method" | "signal"
> & {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: ApiQuery;
  body?: TBody | FormData;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export type ApiMockRequest = {
  path: string;
  method: NonNullable<ApiRequestOptions["method"]>;
  query: URLSearchParams;
  body: unknown;
  headers: Headers;
  signal?: AbortSignal;
};

export type ApiMockAdapter = (request: ApiMockRequest) => Promise<unknown> | unknown;

export type ApiClient = {
  readonly mode: "remote" | "mock";
  readonly baseUrl: string;
  request<TResponse, TBody = unknown>(
    path: string,
    options?: ApiRequestOptions<TBody>,
  ): Promise<TResponse>;
  get<TResponse>(
    path: string,
    options?: Omit<ApiRequestOptions<never>, "body" | "method">,
  ): Promise<TResponse>;
  post<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "body" | "method">,
  ): Promise<TResponse>;
  patch<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "body" | "method">,
  ): Promise<TResponse>;
  delete<TResponse = void>(
    path: string,
    options?: Omit<ApiRequestOptions<never>, "body" | "method">,
  ): Promise<TResponse>;
};

export type CreateApiClientOptions = {
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
  mockAdapter?: ApiMockAdapter;
  mockDelayMs?: number;
};

const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly requestId?: string;
  readonly cause?: unknown;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      details?: unknown;
      requestId?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
    this.cause = options.cause;
  }
}

export function createApiClient({
  baseUrl = publicApiBaseUrl,
  defaultHeaders,
  mockAdapter,
  mockDelayMs = 520,
}: CreateApiClientOptions = {}): ApiClient {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const mode = normalizedBaseUrl ? "remote" : "mock";

  async function request<TResponse, TBody = unknown>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const {
      method = "GET",
      query,
      body,
      headers: requestHeaders,
      signal,
      ...requestInit
    } = options;
    const queryParams = createQueryParams(query);
    const headers = new Headers(defaultHeaders);

    headers.set("Accept", "application/json");
    new Headers(requestHeaders).forEach((value, key) => headers.set(key, value));

    if (mode === "mock") {
      if (!mockAdapter) {
        throw new ApiError(
          "API ünvanı təyin edilməyib və demo adapteri mövcud deyil.",
          { code: "API_NOT_CONFIGURED" },
        );
      }

      await waitForMockDelay(mockDelayMs, signal);
      const result = await mockAdapter({
        path: normalizePath(path),
        method,
        query: queryParams,
        body,
        headers,
        signal,
      });

      return cloneSerializable(result) as TResponse;
    }

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (body !== undefined && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    let response: Response;
    try {
      response = await fetch(buildRequestUrl(normalizedBaseUrl, path, queryParams), {
        ...requestInit,
        cache: requestInit.cache ?? "no-store",
        method,
        headers,
        credentials: "include",
        signal,
        body:
          body === undefined
            ? undefined
            : isFormData
              ? body
              : JSON.stringify(body),
      });
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      throw new ApiError(
        "Serverlə əlaqə yaratmaq mümkün olmadı. İnternet bağlantısını yoxlayın.",
        { code: "NETWORK_ERROR", cause: error },
      );
    }

    const payload = await parseResponsePayload(response);
    if (!response.ok) {
      throw createResponseError(response, payload);
    }

    return unwrapApiEnvelope<TResponse>(payload);
  }

  return {
    mode,
    baseUrl: normalizedBaseUrl,
    request,
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, body, options) =>
      request(path, { ...options, method: "POST", body }),
    patch: (path, body, options) =>
      request(path, { ...options, method: "PATCH", body }),
    delete: (path, options) => request(path, { ...options, method: "DELETE" }),
  };
}

export function createQueryParams(query?: ApiQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (!query) {
    return params;
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, String(entry)));
      return;
    }

    params.set(key, String(value));
  });

  return params;
}

export function unwrapApiEnvelope<T>(payload: unknown): T {
  if (isRecord(payload) && Object.prototype.hasOwnProperty.call(payload, "data")) {
    return payload.data as T;
  }

  return payload as T;
}

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL etibarlı URL deyil.", {
      code: "INVALID_API_BASE_URL",
    });
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new ApiError("API ünvanı yalnız HTTP və ya HTTPS protokolundan istifadə edə bilər.", {
      code: "INVALID_API_PROTOCOL",
    });
  }

  return trimmed;
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function buildRequestUrl(
  baseUrl: string,
  path: string,
  queryParams: URLSearchParams,
): string {
  const queryString = queryParams.toString();
  const url = `${baseUrl}${normalizePath(path)}`;
  return queryString ? `${url}?${queryString}` : url;
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json") || contentType.includes("+json")) {
    try {
      return await response.json();
    } catch (error) {
      throw new ApiError("Server etibarlı JSON cavabı qaytarmadı.", {
        status: response.status,
        code: "INVALID_JSON_RESPONSE",
        cause: error,
      });
    }
  }

  const text = await response.text();
  return text || undefined;
}

function createResponseError(response: Response, payload: unknown): ApiError {
  const errorPayload = isRecord(payload) ? (payload as ApiErrorPayload) : undefined;
  const nestedError =
    errorPayload && typeof errorPayload.error === "object"
      ? errorPayload.error
      : undefined;
  const message =
    nestedError?.message ??
    errorPayload?.message ??
    (typeof errorPayload?.error === "string" ? errorPayload.error : undefined) ??
    (typeof payload === "string" ? payload : undefined) ??
    defaultStatusMessage(response.status);

  return new ApiError(message, {
    status: response.status,
    code: nestedError?.code ?? errorPayload?.code,
    details: nestedError?.details ?? errorPayload?.details,
    requestId:
      errorPayload?.requestId ?? response.headers.get("x-request-id") ?? undefined,
  });
}

function defaultStatusMessage(status: number): string {
  if (status === 401) return "Bu əməliyyat üçün yenidən daxil olun.";
  if (status === 403) return "Bu əməliyyatı yerinə yetirmək üçün icazəniz yoxdur.";
  if (status === 404) return "Sorğu edilən məlumat tapılmadı.";
  if (status === 409) return "Məlumat başqa dəyişikliklə ziddiyyət təşkil edir.";
  if (status === 422) return "Göndərilən məlumatları yenidən yoxlayın.";
  if (status >= 500) return "Serverdə müvəqqəti xəta baş verdi.";
  return "Sorğu tamamlanmadı.";
}

function waitForMockDelay(delayMs: number, signal?: AbortSignal): Promise<void> {
  const duration = Math.max(0, Math.min(delayMs, 2_000));
  if (signal?.aborted) {
    return Promise.reject(createAbortError());
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      signal?.removeEventListener("abort", abort);
      resolve();
    };
    const abort = () => {
      globalThis.clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
      reject(createAbortError());
    };
    const timeout = globalThis.setTimeout(finish, duration);

    signal?.addEventListener("abort", abort, { once: true });
  });
}

function createAbortError(): DOMException {
  return new DOMException("Sorğu dayandırıldı.", "AbortError");
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function cloneSerializable<T>(value: T): T {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}
