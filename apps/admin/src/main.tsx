import "./styles.css"
import { adminKeys } from "@edgeroute/api/admin"
import { createAppQueryClient, onAuthEvent } from "@edgeroute/api/core"
import { AppProviders } from "@edgeroute/ui/components/app-providers"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { lazy, StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { MOCK_ENABLED } from "./app/env"
import { createAppRouter } from "./app/router"

const AdminMockPanel = MOCK_ENABLED ? lazy(() => import("./app/mock-panel")) : null

async function bootstrap() {
  if (MOCK_ENABLED) {
    const { startAdminMocks } = await import("@edgeroute/mocks/admin")
    await startAdminMocks(import.meta.env.BASE_URL)
  }

  const queryClient = createAppQueryClient()
  const router = createAppRouter(queryClient)

  onAuthEvent((event) => {
    if (event === "setup_required") {
      window.location.assign("/setup")
      return
    }
    const current = router.state.location
    if (current.pathname === "/login") return
    void queryClient.invalidateQueries({ queryKey: adminKeys.session })
    void router.navigate({ to: "/login", search: { redirect: current.pathname } })
  })

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppProviders storageKey="edgeroute-admin-theme">
          <RouterProvider router={router} />
          {AdminMockPanel ? (
            <Suspense fallback={null}>
              <AdminMockPanel router={router} />
            </Suspense>
          ) : null}
        </AppProviders>
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()
