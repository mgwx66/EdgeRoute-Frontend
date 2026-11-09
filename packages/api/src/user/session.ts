import { queryOptions } from "@tanstack/react-query"
import { z } from "zod/mini"
import { parseContract } from "../core/contract"
import { flag, text } from "../core/schema"
import { registerUserSessionRefresher, setUserCsrfToken, userRequest } from "./client"

export const themeSchema = z.enum(["system", "light", "dark"])

export const userSessionSchema = z.looseObject({
  authenticated: z.boolean(),
  impersonated: flag(false),
  sensitiveWritesLocked: flag(false),
  csrfToken: z.string(),
  theme: z.catch(themeSchema, "system"),
  licenseAllowed: flag(true),
  licenseStatusAvailable: flag(true),
  licenseReadOnly: flag(false),
  licenseFeatures: z._default(z.record(z.string(), z.boolean()), {}),
})

export type UserSession = z.infer<typeof userSessionSchema>

export const portalSchema = z.looseObject({
  productName: text(),
  siteName: text(),
  title: text(),
  description: text(),
  footerText: text(),
  logoURL: text(),
  showFinance: flag(false),
  showVersion: flag(false),
  version: text(),
})

export type Portal = z.infer<typeof portalSchema>

const optionalText = () => z.optional(z.string())

export const apiUserSchema = z.looseObject({
  id: z.number(),
  username: z.string(),
  fullname: optionalText(),
  company: optionalText(),
  mobile: optionalText(),
  email: optionalText(),
  verifiedEmail: optionalText(),
  emailVerified: z.optional(z.boolean()),
  nodeCluster: z.optional(z.looseObject({ id: z.number(), name: z.string() })),
})

export const profileSchema = z.looseObject({
  user: apiUserSchema,
  emailVerificationRequired: flag(false),
  passwordLocked: flag(false),
})

export type UserProfile = z.infer<typeof profileSchema>

export const userKeys = {
  session: ["user", "session"] as const,
  portal: ["user", "portal"] as const,
  profile: ["user", "profile"] as const,
}

export const profileQuery = queryOptions({
  queryKey: userKeys.profile,
  queryFn: async () => parseContract(profileSchema, await userRequest<unknown>("GET", "/api/profile"), "GET /api/profile"),
  staleTime: 5 * 60_000,
})

function acceptSession(data: unknown, endpoint: string) {
  const session = parseContract(userSessionSchema, data, endpoint)
  setUserCsrfToken(session.csrfToken)
  return session
}

export async function fetchUserSession() {
  return acceptSession(await userRequest<unknown>("GET", "/api/session"), "GET /api/session")
}

registerUserSessionRefresher(async () => (await fetchUserSession()).csrfToken)

export const userSessionQuery = queryOptions({
  queryKey: userKeys.session,
  queryFn: fetchUserSession,
  staleTime: Infinity,
})

export const portalQuery = queryOptions({
  queryKey: userKeys.portal,
  queryFn: async () => parseContract(portalSchema, await userRequest<unknown>("GET", "/api/portal"), "GET /api/portal"),
  staleTime: 5 * 60_000,
})

export interface UserLoginInput {
  username: string
  password: string
  otpCode?: string
  captchaToken?: string
}

/** On success the session is rotated; the returned SessionResponse carries the new CSRF token. */
export async function userLogin(input: UserLoginInput) {
  const data = await userRequest<unknown>("POST", "/api/login", { body: { ...input }, authRedirect: false })
  return acceptSession(data, "POST /api/login")
}

export async function userLogout() {
  await userRequest<{ ok: boolean }>("POST", "/api/logout", { authRedirect: false })
  setUserCsrfToken(null)
}

export async function saveUserTheme(theme: z.infer<typeof themeSchema>) {
  return userRequest<{ ok: boolean }>("POST", "/api/theme", { body: { theme } })
}
