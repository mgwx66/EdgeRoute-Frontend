import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type ProxyOptions } from "vite"
import { dropMockWorker, isDemoBuild } from "../../packages/mocks/vite-plugin"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiTarget = env.VITE_API_TARGET
  const demoMocks = isDemoBuild(env)
  const proxy: Record<string, string | ProxyOptions> = {
    // In development the admin app runs on :3001 under /admin/; proxy it so both apps share one origin
    // the same way the Go backend serves them in production.
    "^/admin(/|$)": { target: "http://localhost:3001", ws: true },
  }
  if (apiTarget) {
    proxy["/api"] = { target: apiTarget, changeOrigin: true }
    proxy["/oauth"] = { target: apiTarget, changeOrigin: true }
  }
  return {
    base: "/",
    plugins: [react(), tailwindcss(), ...(demoMocks ? [] : [dropMockWorker()])],
    define: { "import.meta.env.VITE_DEMO_MOCKS": JSON.stringify(demoMocks ? "true" : "") },
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    server: { proxy, allowedHosts: true },
    build: { outDir: "dist", sourcemap: true },
  }
})
