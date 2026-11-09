import type { AdminSession } from "@edgeroute/api/admin"
import { ADMIN_REGISTRY, ADMIN_ROUTES, type AdminNavGroup, type AdminRouteEntry } from "./registry"

type AccessSubject = Pick<AdminSession, "permissions" | "isSuper">

export function canAccess(session: AccessSubject, entry: Pick<AdminRouteEntry, "permission" | "superOnly">) {
  if (entry.superOnly && !session.isSuper) return false
  return session.permissions.has(entry.permission)
}

/** Navigation = registry ∩ session menus. Groups without any visible entry are dropped. */
export function visibleAdminNav(session: AccessSubject): AdminNavGroup[] {
  return ADMIN_REGISTRY.map((group) => ({ ...group, items: group.items.filter((item) => canAccess(session, item)) })).filter(
    (group) => group.items.length > 0,
  )
}

export function firstAccessiblePath(session: AccessSubject): string | null {
  return ADMIN_ROUTES.find((entry) => canAccess(session, entry))?.to ?? null
}
