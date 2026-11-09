import { setupWorker } from "msw/browser"
import { initScenarioFromUrl } from "../scenario"
import { userHandlers } from "./handlers"

export { USER_DEMO_ACCOUNTS, rotateUserCsrf, userHandlers, userMockStore } from "./handlers"

export async function startUserMocks(baseUrl: string) {
  initScenarioFromUrl()
  const worker = setupWorker(...userHandlers)
  await worker.start({
    serviceWorker: { url: `${baseUrl}mockServiceWorker.js`, options: { scope: baseUrl } },
    onUnhandledRequest: "bypass",
    quiet: true,
  })
}
