import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { onAuthEvent } from "../core/auth-events"
import { safeRedirectPath } from "../core/redirect"
import { toOffsetParams } from "../core/pagination"
import { registerUserSessionRefresher, setUserCsrfToken, userRequest } from "./client"

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
const bodyOf = (call: unknown[]) => JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>

describe("userRequest", () => {
  const fetchMock = vi.fn<typeof fetch>()
  let nextToken = "fresh"

  beforeEach(() => {
    nextToken = "fresh"
    vi.stubGlobal("fetch", fetchMock)
    setUserCsrfToken("old")
    registerUserSessionRefresher(async () => nextToken)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it("puts csrfToken in the JSON body (also for DELETE) and drops undefined fields", async () => {
    fetchMock.mockResolvedValueOnce(json({ ok: true }))
    await userRequest("DELETE", "/api/sites/1", { body: { keep: undefined, force: false } })
    expect(bodyOf(fetchMock.mock.calls[0]!)).toEqual({ force: false, csrfToken: "old" })
  })

  it("sends the Idempotency-Key header when provided", async () => {
    fetchMock.mockResolvedValueOnce(json({ id: 1 }, 201))
    await userRequest("POST", "/api/sites", { body: {}, idempotencyKey: "key-1" })
    const headers = (fetchMock.mock.calls[0]![1] as RequestInit).headers as Record<string, string>
    expect(headers["Idempotency-Key"]).toBe("key-1")
  })

  it("retries a code-less 403 once when the refreshed token differs", async () => {
    fetchMock.mockResolvedValueOnce(json({ error: "CSRF 校验失败" }, 403)).mockResolvedValueOnce(json({ ok: true }))
    await expect(userRequest("POST", "/api/theme", { body: { theme: "dark" } })).resolves.toEqual({ ok: true })
    expect(bodyOf(fetchMock.mock.calls[1]!).csrfToken).toBe("fresh")
  })

  it("does not replay a 403 when the token did not change", async () => {
    nextToken = "old"
    fetchMock.mockResolvedValueOnce(json({ error: "未开放注册" }, 403))
    await expect(userRequest("POST", "/api/register", { body: {} })).rejects.toMatchObject({ kind: "forbidden" })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("never retries a 403 that carries a business code", async () => {
    fetchMock.mockResolvedValueOnce(json({ error: "请先完成实名认证", code: "identity_required" }, 403))
    await expect(userRequest("POST", "/api/sites", { body: {} })).rejects.toMatchObject({ code: "identity_required" })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("keeps mfa_required as a business answer without redirecting", async () => {
    const listener = vi.fn()
    const off = onAuthEvent(listener)
    fetchMock.mockResolvedValueOnce(json({ error: "需要动态码", code: "mfa_required" }, 401))
    await expect(userRequest("POST", "/api/login", { body: {}, authRedirect: false })).rejects.toMatchObject({ code: "mfa_required" })
    expect(listener).not.toHaveBeenCalled()
    off()
  })

  it("maps 502 to a retryable unavailable error", async () => {
    fetchMock.mockResolvedValueOnce(json({ error: "暂时无法连接 API 服务" }, 502))
    const error = await userRequest("GET", "/api/dashboard").catch((e: unknown) => e)
    expect(error).toMatchObject({ kind: "unavailable", retryable: true })
  })
})

describe("helpers", () => {
  it("rejects open redirects", () => {
    expect(safeRedirectPath("/sites?a=1")).toBe("/sites?a=1")
    expect(safeRedirectPath("//evil.com")).toBe("/")
    expect(safeRedirectPath("https://evil.com")).toBe("/")
    expect(safeRedirectPath("/\\evil.com")).toBe("/")
  })

  it("clamps offset pagination to backend limits", () => {
    expect(toOffsetParams(3, 20)).toEqual({ offset: 40, size: 20 })
    expect(toOffsetParams(0, 500)).toEqual({ offset: 0, size: 100 })
  })
})
