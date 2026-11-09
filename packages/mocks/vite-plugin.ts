import { rmSync } from "node:fs"
import { resolve } from "node:path"
import type { Plugin } from "vite"

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
