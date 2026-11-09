import { safeRedirectPath } from "@edgeroute/api/core"
import { userSessionQuery } from "@edgeroute/api/user"
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
import { NotFoundPage } from "./not-found"
import { PLACEHOLDER_ITEMS } from "./nav"

// Route-level code splitting: the login screen never downloads the shell, and each page is its own chunk.
const LoginPage = lazyRouteComponent(() => import("@/features/auth/login-page"), "LoginPage")
const UserShell = lazyRouteComponent(() => import("./user-shell"), "UserShell")
const OverviewPage = lazyRouteComponent(() => import("@/features/overview/overview-page"), "OverviewPage")
const PlaceholderPage = lazy(() => import("@/features/placeholder/placeholder-page").then((m) => ({ default: m.PlaceholderPage })))

export interface RouterContext {
  queryClient: QueryClient
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  notFoundComponent: NotFoundPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  validateSearch: (search: Record<string, unknown>): { redirect?: string; "oauth-error"?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    "oauth-error": typeof search["oauth-error"] === "string" ? search["oauth-error"] : undefined,
  }),
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.ensureQueryData(userSessionQuery)
    if (session.authenticated) throw redirect({ href: safeRedirectPath(search.redirect) })
  },
  component: LoginPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(userSessionQuery)
    if (!session.authenticated) {
      throw redirect({ to: "/login", search: { redirect: location.href } })
    }
  },
  component: UserShell,
})

const overviewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  component: OverviewPage,
})

const placeholderRoutes = PLACEHOLDER_ITEMS.map((item) =>
  createRoute({
    getParentRoute: () => appRoute,
    path: item.to,
    component: () => <PlaceholderPage item={item} />,
  }),
)

const designRoutes = import.meta.env.DEV
  ? [
      createRoute({
        getParentRoute: () => appRoute,
        path: "design",
        component: lazyRouteComponent(() => import("@/features/design/design-page"), "DesignPage"),
      }),
    ]
  : []

const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([overviewRoute, ...placeholderRoutes, ...designRoutes]),
])

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  })
}

export type AppRouter = ReturnType<typeof createAppRouter>
