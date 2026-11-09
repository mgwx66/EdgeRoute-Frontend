import { adminSessionQuery, type AdminSession } from "@edgeroute/api/admin"
import { safeRedirectPath } from "@edgeroute/api/core"
import type { QueryClient } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
  redirect,
} from "@tanstack/react-router"
import { lazy } from "react"
import { canAccess, firstAccessiblePath } from "./access"
import { NotFoundPage } from "./not-found"
import { ADMIN_ROUTES } from "./registry"

// Route-level code splitting: the login screen never downloads the shell, and each page is its own chunk.
const LoginPage = lazyRouteComponent(() => import("@/features/auth/login-page"), "LoginPage")
const AdminShell = lazyRouteComponent(() => import("./admin-shell"), "AdminShell")
const DashboardPage = lazyRouteComponent(() => import("@/features/dashboard/dashboard-page"), "DashboardPage")
const ForbiddenPage = lazyRouteComponent(() => import("@/features/forbidden/forbidden-page"), "ForbiddenPage")
const PlannedPage = lazy(() => import("@edgeroute/ui/components/planned-page").then((m) => ({ default: m.PlannedPage })))

export interface RouterContext {
  queryClient: QueryClient
}

/** The installer is a backend-served page outside this SPA. */
function goToSetup(): never {
  window.location.assign("/setup")
  throw new Promise(() => undefined)
}

async function loadSession(queryClient: QueryClient): Promise<AdminSession> {
  const session = await queryClient.ensureQueryData(adminSessionQuery)
  if (session.setupRequired) goToSetup()
  return session
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  notFoundComponent: NotFoundPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: async ({ context, search }) => {
    const session = await loadSession(context.queryClient)
    if (session.authenticated) {
      throw redirect({ to: safeRedirectPath(search.redirect, firstAccessiblePath(session) ?? "/forbidden") })
    }
  },
  component: LoginPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  beforeLoad: async ({ context, location }) => {
    const session = await loadSession(context.queryClient)
    if (!session.authenticated) throw redirect({ to: "/login", search: { redirect: location.pathname } })
    return { session }
  },
  component: AdminShell,
})

const forbiddenRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "forbidden",
  validateSearch: (search: Record<string, unknown>): { from?: string } => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  component: ForbiddenPage,
})

/**
 * Every registry route is guarded before any loader runs, so a page without permission never issues
 * business requests — even when the URL is typed in directly.
 */
const registryRoutes = ADMIN_ROUTES.map((entry) =>
  createRoute({
    getParentRoute: () => appRoute,
    path: entry.to,
    beforeLoad: ({ context }) => {
      if (canAccess(context.session, entry)) return
      if (entry.to === "/") {
        const fallback = firstAccessiblePath(context.session)
        if (fallback) throw redirect({ to: fallback })
      }
      throw redirect({ to: "/forbidden", search: { from: entry.to } })
    },
    component:
      entry.to === "/"
        ? DashboardPage
        : () => (
            <PlannedPage
              id={entry.id}
              module={entry.module}
              icon={entry.icon}
              title={entry.label}
              description={entry.description}
              phase="第三期"
              apis={entry.apis}
            />
          ),
  }),
)

const routeTree = rootRoute.addChildren([loginRoute, appRoute.addChildren([forbiddenRoute, ...registryRoutes])])

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    basepath: "/admin",
    context: { queryClient },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  })
}

export type AppRouter = ReturnType<typeof createAppRouter>
