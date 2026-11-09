import { rmSync } from "node:fs"
import { resolve } from "node:path"
import type { Plugin } from "vite"

/**
 * Demo builds bundle the mocks so a static deployment works without the Go backend.
 * On by default for Vercel preview deployments; never on for production unless forced.
 */
export function isDemoBuild(env: Record<string, string>) {
  if (env.VITE_DEMO_MOCKS === "false") return false
  return env.VITE_DEMO_MOCKS === "true" || process.env.VERCEL_ENV === "preview"
}

/** The MSW worker lives in `public/` for dev; strip it from production output. */
export function dropMockWorker(): Plugin {
  let outDir = "dist"
  return {
    name: "edgeroute:drop-mock-worker",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      rmSync(resolve(outDir, "mockServiceWorker.js"), { force: true })
    },
  }
}
