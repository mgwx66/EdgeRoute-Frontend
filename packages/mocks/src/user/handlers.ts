import { http, HttpResponse } from "msw"
import { mockLatency } from "../scenario"
import { createMockStore, randomToken } from "../store"

export const USER_DEMO_ACCOUNTS = [
  { username: "demo", password: "Demo@1234", mfa: false, note: "普通账号" },
  { username: "mfa", password: "Demo@1234", mfa: true, note: "开启 MFA，动态码 123456" },
] as const

interface UserMockState {
  authenticated: boolean
  username: string
  csrfToken: string
  theme: "system" | "light" | "dark"
  impersonated: boolean
  licenseReadOnly: boolean
}

export const userMockStore = createMockStore<UserMockState>("user", () => ({
  authenticated: false,
  username: "",
  csrfToken: randomToken(),
  theme: "system",
  impersonated: false,
  licenseReadOnly: false,
}))

function sessionResponse(state: UserMockState) {
  return {
    authenticated: state.authenticated,
    impersonated: state.authenticated && state.impersonated,
    sensitiveWritesLocked: state.authenticated && state.impersonated,
    csrfToken: state.csrfToken,
    theme: state.theme,
    licenseAllowed: !state.licenseReadOnly,
    licenseStatusAvailable: true,
    licenseReadOnly: state.licenseReadOnly,
    licenseFeatures: {},
  }
}

const fail = (status: number, error: string, code?: string) => HttpResponse.json(code ? { error, code } : { error }, { status })

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function csrfOk(body: Record<string, unknown> | null) {
  return body !== null && body.csrfToken === userMockStore.get().csrfToken
}

/** Invalidate the server-side token so the next write exercises the refresh-and-retry path. */
export function rotateUserCsrf() {
  userMockStore.patch({ csrfToken: randomToken() })
}

export const userHandlers = [
  http.get("/api/portal", async () => {
    await mockLatency()
    return HttpResponse.json({
      landingPageEnabled: false,
      productName: "EdgeRoute",
      siteName: "EdgeRoute CDN",
      title: "EdgeRoute 控制台",
      description: "全球边缘加速与安全防护",
      footerText: "© EdgeRoute",
      privacyPolicyURL: "",
      termsURL: "",
      logoURL: "",
      faviconURL: "",
      showFinance: true,
      showVersion: true,
      version: "1.0.0-mock",
      showTrafficCharts: true,
      showBandwidthCharts: true,
      defaultTrafficDays: 7,
      bandwidthUnit: "bit",
      requireIdentity: false,
    })
  }),

  http.get("/api/session", async () => {
    await mockLatency()
    return HttpResponse.json(sessionResponse(userMockStore.get()))
  }),

  http.post("/api/login", async ({ request }) => {
    await mockLatency()
    const body = await readJson(request)
    if (!csrfOk(body)) return fail(403, "CSRF 校验失败")
    const username = typeof body?.username === "string" ? body.username.trim() : ""
    const password = typeof body?.password === "string" ? body.password : ""
    if (!username || !password) return fail(400, "请输入有效的用户名和密码")
    const account = USER_DEMO_ACCOUNTS.find((a) => a.username === username && a.password === password)
    if (!account) return fail(401, "用户名或密码错误")
    if (account.mfa) {
      const otp = typeof body?.otpCode === "string" ? body.otpCode : ""
      if (!otp) return fail(401, "请输入动态验证码", "mfa_required")
      if (otp !== "123456") return fail(401, "动态验证码错误", "mfa_required")
    }
    const next = userMockStore.patch({ authenticated: true, username, csrfToken: randomToken() })
    return HttpResponse.json(sessionResponse(next))
  }),

  http.post("/api/logout", async ({ request }) => {
    await mockLatency()
    if (!csrfOk(await readJson(request))) return fail(403, "CSRF 校验失败")
    userMockStore.patch({ authenticated: false, username: "", impersonated: false, csrfToken: randomToken() })
    return HttpResponse.json({ ok: true })
  }),

  http.post("/api/theme", async ({ request }) => {
    await mockLatency()
    const body = await readJson(request)
    if (!userMockStore.get().authenticated) return fail(401, "请先登录")
    if (!csrfOk(body)) return fail(403, "CSRF 校验失败")
    const theme = body?.theme
    if (theme !== "system" && theme !== "light" && theme !== "dark") return fail(400, "主题设置无效")
    userMockStore.patch({ theme })
    return HttpResponse.json({ ok: true })
  }),

  http.get("/api/profile", async () => {
    await mockLatency()
    const state = userMockStore.get()
    if (!state.authenticated) return fail(401, "请先登录")
    const email = `${state.username}@example.com`
    return HttpResponse.json({
      user: {
        id: state.username === "mfa" ? 2 : 1,
        username: state.username,
        fullname: state.username === "mfa" ? "安全演示账号" : "演示用户",
        company: "EdgeRoute Demo",
        email,
        verifiedEmail: email,
        emailVerified: true,
      },
      emailVerificationRequired: false,
      passwordLocked: false,
    })
  }),

  http.all("/api/*", async () => {
    await mockLatency()
    return fail(404, "接口不存在")
  }),
]
