export type ApiErrorPayload = {
  detail?: string;
  message?: string;
};

/**
 * Resolves the API base URL depending on the execution context:
 * - Server-side functions (Node.js runtime): reads the bound variable `process.env.BACKEND_URL`
 *   injected by Vercel for the service binding, falling back to NEXT_PUBLIC_API_BASE_URL or localhost.
 * - Client-side browser: uses NEXT_PUBLIC_API_BASE_URL if explicitly configured, otherwise empty string
 *   so requests are relative and routed through the Vercel rewrite rule `/api/(.*)` -> `backend`.
 */
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:8000"
    );
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
}

/**
 * Resolves the full URL for an API endpoint path.
 * In server-side functions, it uses `new URL(path, process.env.BACKEND_URL)` to call the internal service binding.
 */
export function resolveApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window === "undefined") {
    const backendBase =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:8000";

    const base = backendBase.endsWith("/") ? backendBase : `${backendBase}/`;
    return new URL(normalizedPath.replace(/^\//, ""), base).toString();
  }

  const clientBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (clientBase) {
    const base = clientBase.endsWith("/") ? clientBase : `${clientBase}/`;
    return new URL(normalizedPath.replace(/^\//, ""), base).toString();
  }

  return normalizedPath;
}

export const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as any;
    if (typeof payload.detail === "string") return payload.detail;
    if (Array.isArray(payload.detail)) {
      return payload.detail
        .map((err: any) => `${err.loc?.slice(-1)[0] ?? ""}: ${err.msg}`)
        .join("; ");
    }
    if (typeof payload.message === "string") return payload.message;
    return response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const customHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    try {
      const clerk = (window as any).Clerk;
      if (clerk?.session) {
        const token = await clerk.session.getToken();
        if (token) {
          customHeaders["Authorization"] = `Bearer ${token}`;
        }
      }
      if (clerk?.user?.id) {
        customHeaders["X-User-Id"] = clerk.user.id;
      }
    } catch {
      // Ignore token acquisition errors in client
    }
  }

  const requestUrl = resolveApiUrl(path);

  const response = await fetch(requestUrl, {
    ...init,
    headers: {
      ...customHeaders,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}