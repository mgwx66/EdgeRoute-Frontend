export type ApiErrorKind =
  | "network"
  | "bad_request"
  | "unauthenticated"
  | "csrf"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "setup_required"
  | "payload_too_large"
  | "unprocessable"
  | "rate_limited"
  | "unavailable"
  | "timeout"
  | "contract"
  | "server"

export type FieldErrors = Record<string, string[]>

export interface ApiErrorInit {
  kind: ApiErrorKind
  status: number
  message: string
  /** Machine-readable code from the backend, e.g. `mfa_required`, `identity_required`. */
  code?: string
  fieldErrors?: FieldErrors
  retryAfterSeconds?: number
  endpoint?: string
  raw?: unknown
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number
  readonly code?: string
  readonly fieldErrors?: FieldErrors
  readonly retryAfterSeconds?: number
  readonly endpoint?: string
  readonly raw?: unknown

  constructor(init: ApiErrorInit) {
    super(init.message)
    this.name = "ApiError"
    this.kind = init.kind
    this.status = init.status
    this.code = init.code
    this.fieldErrors = init.fieldErrors
    this.retryAfterSeconds = init.retryAfterSeconds
    this.endpoint = init.endpoint
    this.raw = init.raw
  }

  /** Safe to retry automatically: the request was not processed or failed transiently. */
  get retryable() {
    return this.kind === "network" || this.kind === "unavailable" || this.kind === "timeout" || this.kind === "server"
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function kindFromStatus(status: number): ApiErrorKind {
  switch (status) {
    case 400:
      return "bad_request"
    case 401:
      return "unauthenticated"
    case 403:
      return "forbidden"
    case 404:
      return "not_found"
    case 409:
      return "conflict"
    case 413:
      return "payload_too_large"
    case 422:
      return "unprocessable"
    case 429:
      return "rate_limited"
    case 502:
    case 503:
      return "unavailable"
    case 504:
      return "timeout"
    default:
      return status >= 500 ? "server" : "bad_request"
  }
}

export function parseRetryAfter(headers: Headers): number | undefined {
  const value = headers.get("Retry-After")
  if (!value) return undefined
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined
}

export interface ErrorDescription {
  title: string
  message: string
  hint?: string
}

/** Maps an error to UI copy. Branches on kind/code only, never on backend message text. */
export function describeError(error: unknown): ErrorDescription {
  if (!isApiError(error)) {
    return { title: "出现了意外错误", message: error instanceof Error ? error.message : "请刷新页面后重试" }
  }
  switch (error.kind) {
    case "network":
      return { title: "网络连接失败", message: "无法连接到服务器，请检查网络后重试。" }
    case "unavailable":
      return { title: "服务暂时不可用", message: error.message || "上游服务暂时不可用，请稍后重试。" }
    case "timeout":
      return { title: "请求超时", message: "服务响应超时，请稍后重试。" }
    case "rate_limited":
      return {
        title: "操作过于频繁",
        message: error.message || "请稍后再试。",
        hint: error.retryAfterSeconds ? `请在 ${error.retryAfterSeconds} 秒后重试` : undefined,
      }
    case "forbidden":
      return { title: "没有权限", message: error.message || "当前账号无权执行该操作。" }
    case "not_found":
      return { title: "资源不存在", message: error.message || "请求的资源不存在或已被删除。" }
    case "payload_too_large":
      return { title: "内容过大", message: "提交的内容超过大小上限，请精简后重试。" }
    case "contract":
      return { title: "数据格式异常", message: "服务端返回的数据与预期不符。", hint: error.endpoint }
    case "csrf":
      return { title: "页面已失效", message: "安全令牌已过期，请刷新页面后重试。" }
    default:
      return { title: "操作失败", message: error.message || "请稍后重试。" }
  }
}
