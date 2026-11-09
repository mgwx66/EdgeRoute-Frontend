import "./styles.css"
import { createAppQueryClient, onAuthEvent } from "@edgeroute/api/core"
import { userKeys, type UserSession } from "@edgeroute/api/user"
import { AppProviders } from "@edgeroute/ui/components/app-providers"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { lazy, StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { MOCK_ENABLED } from "./app/env"
import { createAppRouter } from "./app/router"

const UserMockPanel = MOCK_ENABLED ? lazy(() => import("./app/mock-panel")) : null

async function bootstrap() {
  if (MOCK_ENABLED) {
    const { startUserMocks } = await import("@edgeroute/mocks/user")
    await startUserMocks(import.meta.env.BASE_URL)
  }

  const queryClient = createAppQueryClient()
  const router = createAppRouter(queryClient)

  // Any 401 from a business call: mark the session anonymous and send the user to login, keeping
  // the current location so they return to it afterwards.
  onAuthEvent((event) => {
    if (event !== "unauthenticated") return
    const current = router.state.location
    if (current.pathname === "/login") return
    queryClient.setQueryData<UserSession>(userKeys.session, (old) => (old ? { ...old, authenticated: false } : old))
    void queryClient.invalidateQueries({ queryKey: userKeys.session })
    void router.navigate({ to: "/login", search: { redirect: current.href } })
  })

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppProviders storageKey="edgeroute-user-theme">
          <RouterProvider router={router} />
          {UserMockPanel ? (
            <Suspense fallback={null}>
              <UserMockPanel router={router} />
            </Suspense>
          ) : null}
        </AppProviders>
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()
