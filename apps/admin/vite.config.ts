import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type ProxyOptions } from "vite"
import { dropMockWorker } from "../../packages/mocks/vite-plugin"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiTarget = env.VITE_API_TARGET
  const proxy: Record<string, string | ProxyOptions> = {}
  if (apiTarget) {
    for (const prefix of ["/api", "/csrf", "/setup", "/recover", "/ui"]) proxy[prefix] = { target: apiTarget, changeOrigin: true }
  }
  return {
    // Served by the Go backend under /admin/ in production.
    base: "/admin/",
    plugins: [react(), tailwindcss(), dropMockWorker()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    server: { proxy, allowedHosts: true },
    build: { outDir: "dist", sourcemap: true },
  }
})
