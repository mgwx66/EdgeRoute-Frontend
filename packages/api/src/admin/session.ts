import { queryOptions } from "@tanstack/react-query"
import { z } from "zod/mini"
import { parseContract } from "../core/contract"
import { flag, text } from "../core/schema"
import { adminRequest, registerAdminSessionRefresher, setAdminCsrfToken } from "./client"
import { normalizeMenus } from "./menus"

export const adminSessionSchema = z.looseObject({
  authenticated: z.boolean(),
  setupRequired: flag(false),
  csrfToken: z.string(),
  loginToken: text(),
  systemName: text(),
  productName: text(),
  version: text(),
  showVersion: flag(false),
  menus: z.optional(z.unknown()),
  admin: z.optional(
    z.looseObject({
      id: z.number(),
      name: z.string(),
      /** Not in the documented response yet (pending). Treated as false when absent. */
      isSuper: z.optional(z.boolean()),
    }),
  ),
})

export type AdminSessionRaw = z.infer<typeof adminSessionSchema>

export interface AdminSession extends AdminSessionRaw {
  permissions: Set<string>
  isSuper: boolean
}

export const adminKeys = {
  session: ["admin", "session"] as const,
}

let latestLoginToken = ""

export async function fetchAdminSession(): Promise<AdminSession> {
  const data = await adminRequest<unknown>("GET", "/api/admin/session")
  const session = parseContract(adminSessionSchema, data, "GET /api/admin/session")
  setAdminCsrfToken(session.csrfToken)
  latestLoginToken = session.loginToken
  return { ...session, permissions: normalizeMenus(session.menus), isSuper: session.admin?.isSuper === true }
}

registerAdminSessionRefresher(async () => (await fetchAdminSession()).csrfToken)

export const adminSessionQuery = queryOptions({
  queryKey: adminKeys.session,
  queryFn: fetchAdminSession,
  staleTime: Infinity,
})

export interface AdminLoginInput {
  username: string
  password: string
  remember: boolean
}

export interface AdminLoginResult {
  requireOTP: boolean
  challenge?: string
}

export async function adminLogin(input: AdminLoginInput): Promise<AdminLoginResult> {
  if (!latestLoginToken) await fetchAdminSession()
  const data = await adminRequest<{ requireOTP?: boolean; challenge?: string }>("POST", "/api/admin/login", {
    form: { ...input, loginToken: latestLoginToken },
    authRedirect: false,
  })
  return { requireOTP: data?.requireOTP === true, challenge: data?.challenge }
}

export async function adminVerifyOtp(input: { challenge: string; otpCode: string; remember: boolean }) {
  await adminRequest<unknown>("POST", "/api/admin/otp", { form: input, authRedirect: false })
}

export async function adminLogout() {
  await adminRequest<unknown>("POST", "/api/admin/logout", { authRedirect: false })
  setAdminCsrfToken(null)
}
