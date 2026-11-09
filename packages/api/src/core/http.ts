import { ApiError } from "./errors"

export type QueryValue = string | number | boolean | null | undefined | ReadonlyArray<string | number>
export type QueryParams = Record<string, QueryValue>

export function buildUrl(path: string, query?: QueryParams) {
  if (!query) return path
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item))
    } else {
      params.append(key, String(value))
    }
  }
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

export interface RawResponse {
  status: number
  ok: boolean
  headers: Headers
  isJson: boolean
  body: unknown
}

export async function sendRequest(url: string, init: RequestInit): Promise<RawResponse> {
  let response: Response
  try {
    response = await fetch(url, { credentials: "same-origin", ...init })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause
    throw new ApiError({ kind: "network", status: 0, message: "网络连接失败", endpoint: url, raw: cause })
  }
  const contentType = response.headers.get("Content-Type") ?? ""
  const isJson = contentType.includes("application/json")
  let body: unknown = null
  if (response.status !== 204) {
    const text = await response.text()
    if (isJson && text) {
      try {
        body = JSON.parse(text)
      } catch {
        body = text
      }
    } else {
      body = text
    }
  }
  return { status: response.status, ok: response.ok, headers: response.headers, isJson, body }
}
