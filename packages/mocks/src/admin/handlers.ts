import { http, HttpResponse } from "msw"
import { mockLatency } from "../scenario"
import { createMockStore, randomToken } from "../store"

/**
 * Assumed `menus` shape (pending confirmation): `[{ code, name }]` with lower-case module codes.
 * The frontend normalizer accepts several shapes, so only this fixture changes once confirmed.
 */
export const ADMIN_MODULES = [
  { code: "common", name: "公共" },
  { code: "server", name: "网站" },
  { code: "node", name: "节点" },
  { code: "dns", name: "DNS" },
  { code: "log", name: "日志" },
  { code: "finance", name: "财务" },
  { code: "user", name: "用户" },
  { code: "admin", name: "管理员" },
  { code: "ticket", name: "工单" },
  { code: "setting", name: "系统设置" },
] as const

export type AdminProfile = "super" | "ops" | "finance"

export const ADMIN_PROFILES: Record<AdminProfile, { label: string; modules: string[]; isSuper: boolean }> = {
  super: { label: "超级管理员（全部模块）", modules: ADMIN_MODULES.map((m) => m.code), isSuper: true },
  ops: { label: "运维（网站 / 节点 / DNS / 日志）", modules: ["common", "server", "node", "dns", "log"], isSuper: false },
  finance: { label: "财务（财务 / 用户 / 工单）", modules: ["finance", "user", "ticket"], isSuper: false },
}

export const ADMIN_DEMO_ACCOUNTS = [
  { username: "admin", password: "Admin@1234", profile: "super", otp: false, note: "超级管理员" },
  { username: "ops", password: "Ops@12345", profile: "ops", otp: true, note: "运维，动态码 123456" },
  { username: "finance", password: "Fin@12345", profile: "finance", otp: false, note: "财务，无仪表盘权限" },
] as const satisfies ReadonlyArray<{ username: string; password: string; profile: AdminProfile; otp: boolean; note: string }>

interface AdminMockState {
  authenticated: boolean
  adminId: number
  adminName: string
  profile: AdminProfile
  csrfToken: string
  loginToken: string
  pendingChallenge: string
  pendingUser: string
}

export const adminMockStore = createMockStore<AdminMockState>("admin", () => ({
  authenticated: false,
  adminId: 0,
  adminName: "",
  profile: "super",
  csrfToken: randomToken(),
  loginToken: randomToken(16),
  pendingChallenge: "",
  pendingUser: "",
}))

export function rotateAdminCsrf() {
  adminMockStore.patch({ csrfToken: randomToken() })
}

export function setAdminProfile(profile: AdminProfile) {
  adminMockStore.patch({ profile })
}

const ok = (data: unknown = {}) => HttpResponse.json({ code: 200, message: "", data })
const fail = (message: string, code = 400) => HttpResponse.json({ code, message, data: null, errors: null }, { status: code === 400 ? 200 : code })
const csrfRejected = () =>
  new HttpResponse("表单已失效，请刷新页面后重试(001)", { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } })

async function readForm(request: Request) {
  return new URLSearchParams(await request.text())
}

function csrfOk(form: URLSearchParams) {
  return form.get("csrfToken") === adminMockStore.get().csrfToken
}

export const adminHandlers = [
  http.get("/api/admin/session", async () => {
    await mockLatency()
    const s = adminMockStore.get()
    const profile = ADMIN_PROFILES[s.profile]
    return ok({
      authenticated: s.authenticated,
      setupRequired: false,
      csrfToken: s.csrfToken,
      loginToken: s.loginToken,
      systemName: "EdgeRoute 管理平台",
      productName: "EdgeRoute",
      version: "1.0.0-mock",
      showVersion: true,
      faviconFileId: 0,
      logoFileId: 0,
      menus: s.authenticated ? ADMIN_MODULES.filter((m) => profile.modules.includes(m.code)) : [],
      ...(s.authenticated ? { admin: { id: s.adminId, name: s.adminName, isSuper: profile.isSuper } } : {}),
    })
  }),

  http.post("/api/admin/login", async ({ request }) => {
    await mockLatency()
    const form = await readForm(request)
    if (!csrfOk(form)) return csrfRejected()
    const state = adminMockStore.get()
    if (form.get("loginToken") !== state.loginToken) return fail("登录页面已失效，请刷新后重试")
    const username = form.get("username")?.trim() ?? ""
    const password = form.get("password") ?? ""
    if (!username || !password) return fail("请输入用户名和密码")
    const account = ADMIN_DEMO_ACCOUNTS.find((a) => a.username === username && a.password === password)
    if (!account) return fail("用户名或密码不正确")
    if (account.otp) {
      const challenge = randomToken(16)
      adminMockStore.patch({ pendingChallenge: challenge, pendingUser: username })
      return ok({ requireOTP: true, challenge })
    }
    adminMockStore.patch({
      authenticated: true,
      adminId: ADMIN_DEMO_ACCOUNTS.indexOf(account) + 1,
      adminName: account.username,
      profile: account.profile,
      csrfToken: randomToken(),
      loginToken: randomToken(16),
    })
    return ok({ requireOTP: false })
  }),

  http.post("/api/admin/otp", async ({ request }) => {
    await mockLatency()
    const form = await readForm(request)
    if (!csrfOk(form)) return csrfRejected()
    const state = adminMockStore.get()
    const challenge = form.get("challenge") ?? ""
    const otpCode = form.get("otpCode") ?? ""
    if (challenge.length !== 32 || otpCode.length < 6 || otpCode.length > 8) return fail("动态密码验证请求无效，请重新登录")
    if (challenge !== state.pendingChallenge) return fail("动态密码验证已过期或登录环境已变化，请重新登录")
    if (otpCode !== "123456") return fail("动态密码不正确")
    const account = ADMIN_DEMO_ACCOUNTS.find((a) => a.username === state.pendingUser)
    if (!account) return fail("动态密码验证已过期或登录环境已变化，请重新登录")
    adminMockStore.patch({
      authenticated: true,
      adminId: ADMIN_DEMO_ACCOUNTS.indexOf(account) + 1,
      adminName: account.username,
      profile: account.profile,
      pendingChallenge: "",
      pendingUser: "",
      csrfToken: randomToken(),
      loginToken: randomToken(16),
    })
    return ok({})
  }),

  http.post("/api/admin/logout", async ({ request }) => {
    await mockLatency()
    const form = await readForm(request)
    if (!csrfOk(form)) return csrfRejected()
    adminMockStore.patch({ authenticated: false, adminId: 0, adminName: "", csrfToken: randomToken(), loginToken: randomToken(16) })
    return ok({})
  }),

  http.all("/api/admin/*", async () => {
    await mockLatency()
    if (!adminMockStore.get().authenticated) {
      return HttpResponse.json({ code: 401, message: "authentication required", data: null }, { status: 401 })
    }
    return HttpResponse.json({ code: 404, message: "接口不存在", data: null }, { status: 404 })
  }),
]
