import { describe, expect, it } from "vitest"
import { canAccess, firstAccessiblePath, visibleAdminNav } from "./access"
import { ADMIN_ROUTES } from "./registry"

const subject = (codes: string[], isSuper = false) => ({ permissions: new Set(codes), isSuper })

describe("admin access", () => {
  it("shows only entries whose module is in the session menus", () => {
    const items = visibleAdminNav(subject(["finance", "user"])).flatMap((g) => g.items.map((i) => i.id))
    expect(items).toEqual(["finance", "users"])
  })

  it("hides super-only entries from non-super admins even with the module", () => {
    const apiNodes = ADMIN_ROUTES.find((r) => r.id === "api-nodes")!
    expect(canAccess(subject(["setting"]), apiNodes)).toBe(false)
    expect(canAccess(subject(["setting"], true), apiNodes)).toBe(true)
  })

  it("falls back to the first accessible page when the dashboard is not allowed", () => {
    expect(firstAccessiblePath(subject(["finance"]))).toBe("/finance")
    expect(firstAccessiblePath(subject(["common"]))).toBe("/")
    expect(firstAccessiblePath(subject([]))).toBeNull()
  })

  it("has unique ids and paths", () => {
    expect(new Set(ADMIN_ROUTES.map((r) => r.id)).size).toBe(ADMIN_ROUTES.length)
    expect(new Set(ADMIN_ROUTES.map((r) => r.to)).size).toBe(ADMIN_ROUTES.length)
  })
})
