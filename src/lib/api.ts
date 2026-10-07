export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, status: number, code: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/+$/, "")

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...init.headers,
      },
    })
  } catch (error) {
    console.error("ارتباط با API برقرار نشد.", error)
    throw new ApiError("ارتباط با سرور برقرار نشد. اتصال اینترنت یا اجرای سرور را بررسی کنید.", 0, "NETWORK_ERROR")
  }

  if (response.status === 204) return undefined as T
  const contentType = response.headers.get("content-type") ?? ""
  const payload: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const errorPayload =
      typeof payload === "object" && payload !== null && "error" in payload
        ? payload.error
        : null
    const message =
      typeof errorPayload === "object" && errorPayload !== null && "message" in errorPayload &&
      typeof errorPayload.message === "string"
        ? errorPayload.message
        : `درخواست ناموفق بود (${response.status}).`
    const code =
      typeof errorPayload === "object" && errorPayload !== null && "code" in errorPayload &&
      typeof errorPayload.code === "string"
        ? errorPayload.code
        : "API_ERROR"
    throw new ApiError(message, response.status, code)
  }

  return payload as T
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path)
}

export function apiPost<T>(path: string, body?: unknown, headers?: HeadersInit): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    headers,
  })
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "PUT", body: JSON.stringify(body) })
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) })
}

export function apiDelete(path: string): Promise<void> {
  return apiRequest<void>(path, { method: "DELETE" })
}
