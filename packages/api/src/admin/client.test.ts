import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { onAuthEvent } from "../core/auth-events"
import { ApiError } from "../core/errors"
import { adminRequest, registerAdminSessionRefresher, setAdminCsrfToken } from "./client"

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8" } })
const text = (body: string, status: number) => new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } })

function sentToken(call: unknown[]) {
  const init = call[1] as RequestInit
  return new URLSearchParams(String(init.body)).get("csrfToken")
}

describe("adminRequest", () => {
  const fetchMock = vi.fn<typeof fetch>()
  let refreshCount = 0

  beforeEach(() => {
    refreshCount = 0
    vi.stubGlobal("fetch", fetchMock)
    setAdminCsrfToken("old-token")
    registerAdminSessionRefresher(async () => {
      refreshCount += 1
      return `fresh-${refreshCount}`
    })
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it("unwraps the envelope on code 200", async () => {
    fetchMock.mockResolvedValueOnce(json({ code: 200, message: "", data: { id: 7 } }))
    await expect(adminRequest("GET", "/api/admin/x")).resolves.toEqual({ id: 7 })
  })

  it("treats HTTP 200 with code 400 as a failure and parses field errors", async () => {
    fetchMock.mockResolvedValueOnce(json({ code: 400, message: "名称不能为空", data: null, errors: [{ param: "name", messages: ["必填"] }] }))
    const error = await adminRequest("POST", "/api/admin/x", { form: {} }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).kind).toBe("bad_request")
    expect((error as ApiError).fieldErrors).toEqual({ name: ["必填"] })
  })

  it("refreshes the CSRF token once on a plain-text 403 and retries", async () => {
    fetchMock
      .mockResolvedValueOnce(text("表单已失效，请刷新页面后重试(001)", 403))
      .mockResolvedValueOnce(json({ code: 200, message: "", data: { ok: true } }))
    await expect(adminRequest("POST", "/api/admin/x", { form: { a: 1 } })).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(sentToken(fetchMock.mock.calls[0]!)).toBe("old-token")
    expect(sentToken(fetchMock.mock.calls[1]!)).toBe("fresh-1")
  })

  it("reports a persistent plain-text 403 (WAF / IP block) as forbidden without looping", async () => {
    fetchMock.mockImplementation(async () => text("Denied By WAF", 403))
    const error = (await adminRequest("POST", "/api/admin/x").catch((e: unknown) => e)) as ApiError
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(error.kind).toBe("forbidden")
    expect(error.message).toBe("Denied By WAF")
  })

  it("emits unauthenticated on 401", async () => {
    const listener = vi.fn()
    const off = onAuthEvent(listener)
    fetchMock.mockResolvedValueOnce(json({ code: 401, message: "authentication required", data: null }, 401))
    await expect(adminRequest("GET", "/api/admin/x")).rejects.toMatchObject({ kind: "unauthenticated" })
    expect(listener).toHaveBeenCalledWith("unauthenticated")
    off()
  })

  it("does not emit unauthenticated when authRedirect is false", async () => {
    const listener = vi.fn()
    const off = onAuthEvent(listener)
    fetchMock.mockResolvedValueOnce(json({ code: 401, message: "authentication required", data: null }, 401))
    await expect(adminRequest("POST", "/api/admin/login", { authRedirect: false })).rejects.toBeInstanceOf(ApiError)
    expect(listener).not.toHaveBeenCalled()
    off()
  })

  it("detects setup required", async () => {
    const listener = vi.fn()
    const off = onAuthEvent(listener)
    fetchMock.mockResolvedValueOnce(json({ code: 409, message: "system setup is required", data: null }, 409))
    await expect(adminRequest("GET", "/api/admin/x")).rejects.toMatchObject({ kind: "setup_required" })
    expect(listener).toHaveBeenCalledWith("setup_required")
    off()
  })
})
