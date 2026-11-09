import { emitAuthEvent } from "../core/auth-events"
import { ApiError, kindFromStatus, parseRetryAfter } from "../core/errors"
import { buildUrl, sendRequest, type QueryParams, type RawResponse } from "../core/http"

/**
 * User portal adapter (`/api/*`).
 * - JSON bodies; undefined fields are dropped so "not sent = keep current value" holds.
 * - CSRF token travels in the JSON body (including DELETE), never in a header.
 * - Errors are `{"error": string, "code"?: string}` with the HTTP status as the error code.
 */

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

let csrfToken: string | null = null
let sessionRefresher: (() => Promise<string>) | null = null

export function setUserCsrfToken(token: string | null) {
  csrfToken = token
}

export function getUserCsrfToken() {
  return csrfToken
}

/** Registered by the session module so the client can obtain/refresh a token without a circular import. */
export function registerUserSessionRefresher(refresher: () => Promise<string>) {
  sessionRefresher = refresher
}

async function refreshToken() {
  if (!sessionRefresher) throw new Error("user session refresher not registered")
  csrfToken = await sessionRefresher()
  return csrfToken
}

export interface UserRequestOptions {
  query?: QueryParams
  body?: Record<string, unknown>
  /** Sent as `Idempotency-Key` header (e.g. `POST /api/sites`). Reuse the same key when retrying. */
  idempotencyKey?: string
  /** Set false for endpoints where 401 is a business answer (login, MFA). */
  authRedirect?: boolean
  signal?: AbortSignal
}

function toApiError(raw: RawResponse, endpoint: string): ApiError {
  const body = (raw.isJson && raw.body && typeof raw.body === "object" ? raw.body : {}) as { error?: unknown; code?: unknown }
  const message = typeof body.error === "string" ? body.error : typeof raw.body === "string" && raw.body ? raw.body : `请求失败（${raw.status}）`
  return new ApiError({
    kind: kindFromStatus(raw.status),
    status: raw.status,
    message,
    code: typeof body.code === "string" ? body.code : undefined,
    retryAfterSeconds: parseRetryAfter(raw.headers),
    endpoint,
    raw: raw.body,
  })
}

export async function userRequest<T>(method: Method, path: string, options: UserRequestOptions = {}): Promise<T> {
  const { query, body, idempotencyKey, authRedirect = true, signal } = options
  const url = buildUrl(path, query)
  const isWrite = method !== "GET"

  if (isWrite && !csrfToken) await refreshToken()

  const send = (token: string | null) => {
    const headers: Record<string, string> = { Accept: "application/json" }
    if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey
    let payload: string | undefined
    if (isWrite) {
      headers["Content-Type"] = "application/json"
      payload = JSON.stringify({ ...body, csrfToken: token ?? undefined })
    }
    return sendRequest(url, { method, headers, body: payload, signal })
  }

  let tokenUsed = csrfToken
  let raw = await send(tokenUsed)

  // A 403 without a business code may be an expired session token. Refresh once; only retry when the
  // token actually changed, so a genuine permission error is never replayed.
  if (isWrite && raw.status === 403) {
    const err = toApiError(raw, url)
    if (!err.code) {
      const fresh = await refreshToken()
      if (fresh && fresh !== tokenUsed) {
        tokenUsed = fresh
        raw = await send(tokenUsed)
      }
    }
  }

  if (!raw.ok) {
    const err = toApiError(raw, url)
    if (err.kind === "unauthenticated" && authRedirect) emitAuthEvent("unauthenticated")
    throw err
  }
  return (raw.status === 204 ? undefined : raw.body) as T
}
