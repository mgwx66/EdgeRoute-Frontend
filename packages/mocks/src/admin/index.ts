import { setupWorker } from "msw/browser"
import { initScenarioFromUrl } from "../scenario"
import { adminHandlers } from "./handlers"

export {
  ADMIN_DEMO_ACCOUNTS,
  ADMIN_PROFILES,
  adminHandlers,
  adminMockStore,
  rotateAdminCsrf,
  setAdminProfile,
  type AdminProfile,
} from "./handlers"

export async function startAdminMocks(baseUrl: string) {
  initScenarioFromUrl()
  const worker = setupWorker(...adminHandlers)
  await worker.start({
    serviceWorker: { url: `${baseUrl}mockServiceWorker.js`, options: { scope: baseUrl } },
    onUnhandledRequest: "bypass",
    quiet: true,
  })
}
