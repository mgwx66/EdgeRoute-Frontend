import { emitAuthEvent } from "../core/auth-events"
import { ApiError, kindFromStatus, parseRetryAfter, type FieldErrors } from "../core/errors"
import { buildUrl, sendRequest, type QueryParams, type RawResponse } from "../core/http"
import { encodeAdminForm, type FormFields } from "./form"

/**
 * Admin adapter (`/api/admin/*`).
 * - Envelope `{code, message, data, errors}`; success requires HTTP 2xx AND `code === 200`.
 * - CSRF token is a form field, valid 30 minutes. We refresh proactively after 25 minutes, and a
 *   403 plain-text response (CSRF rejection — request was not processed) triggers one refresh + retry.
 */

const CSRF_REFRESH_AFTER_MS = 25 * 60_000

let csrfToken: string | null = null
let csrfIssuedAt = 0
let sessionRefresher: (() => Promise<string>) | null = null

export function setAdminCsrfToken(token: string | null, issuedAt = Date.now()) {
  csrfToken = token
  csrfIssuedAt = token ? issuedAt : 0
}

export function getAdminCsrfState() {
  return { token: csrfToken, issuedAt: csrfIssuedAt }
}

export function registerAdminSessionRefresher(refresher: () => Promise<string>) {
  sessionRefresher = refresher
}

async function refreshToken() {
  if (!sessionRefresher) throw new Error("admin session refresher not registered")
  setAdminCsrfToken(await sessionRefresher())
  return csrfToken
}

async function ensureFreshToken() {
  if (!csrfToken || Date.now() - csrfIssuedAt > CSRF_REFRESH_AFTER_MS) await refreshToken()
  return csrfToken
}

interface Envelope {
  code?: unknown
  message?: unknown
  data?: unknown
  errors?: unknown
}

/** `FailField` shape is unconfirmed; accept `[{param|field|name, messages|message}]`. */
function parseFieldErrors(errors: unknown): FieldErrors | undefined {
  if (!Array.isArray(errors) || errors.length === 0) return undefined
  const result: FieldErrors = {}
  for (const entry of errors) {
    if (!entry || typeof entry !== "object") continue
    const e = entry as Record<string, unknown>
    const field = [e.param, e.field, e.name].find((v): v is string => typeof v === "string")
    if (!field) continue
    const messages = Array.isArray(e.messages) ? e.messages.filter((m): m is string => typeof m === "string") : typeof e.message === "string" ? [e.message] : []
    result[field] = [...(result[field] ?? []), ...messages]
  }
  return Object.keys(result).length ? result : undefined
}

/**
 * Plain-text 403 means the request never reached the handler: CSRF rejection, WAF (`Denied By WAF`)
 * or IP block (empty body). We treat it as CSRF for one refresh-and-retry; if it persists with a
 * fresh token it is reported as `forbidden`.
 */
function isPlainTextForbidden(raw: RawResponse) {
  return raw.status === 403 && !raw.isJson
}

function toApiError(raw: RawResponse, endpoint: string, csrfRetried: boolean): ApiError {
  if (isPlainTextForbidden(raw)) {
    const text = typeof raw.body === "string" && raw.body ? raw.body : "请求被拒绝"
    return new ApiError({ kind: csrfRetried ? "forbidden" : "csrf", status: 403, message: text, endpoint })
  }
  const env = (raw.isJson && raw.body && typeof raw.body === "object" ? raw.body : {}) as Envelope
  const envCode = typeof env.code === "number" ? env.code : undefined
  const status = raw.ok && envCode !== undefined ? envCode : raw.status
  const message = typeof env.message === "string" && env.message ? env.message : `请求失败（${status}）`
  const setupRequired = status === 409 && env.data === null && /setup/i.test(message)
  return new ApiError({
    kind: setupRequired ? "setup_required" : kindFromStatus(status),
    status,
    message,
    fieldErrors: parseFieldErrors(env.errors),
    retryAfterSeconds: parseRetryAfter(raw.headers),
    endpoint,
    raw: raw.body,
  })
}

export interface AdminRequestOptions {
  query?: QueryParams
  form?: FormFields
  authRedirect?: boolean
  signal?: AbortSignal
}

export async function adminRequest<T>(method: "GET" | "POST", path: string, options: AdminRequestOptions = {}): Promise<T> {
  const { query, form, authRedirect = true, signal } = options
  const url = buildUrl(path, query)
  const isWrite = method === "POST"

  const send = (token: string | null) => {
    if (!isWrite) return sendRequest(url, { method, headers: { Accept: "application/json" }, signal })
    const body = encodeAdminForm({ ...form, csrfToken: token ?? undefined })
    return sendRequest(url, {
      method,
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body,
      signal,
    })
  }

  let raw = await send(isWrite ? await ensureFreshToken() : null)
  let csrfRetried = false
  if (isWrite && isPlainTextForbidden(raw)) {
    csrfRetried = true
    raw = await send(await refreshToken())
  }

  const env = raw.isJson && raw.body && typeof raw.body === "object" ? (raw.body as Envelope) : null
  if (raw.ok && env && env.code === 200) return env.data as T

  const err = toApiError(raw, url, csrfRetried || !isWrite)
  if (authRedirect && err.kind === "unauthenticated") emitAuthEvent("unauthenticated")
  if (err.kind === "setup_required") emitAuthEvent("setup_required")
  throw err
}
