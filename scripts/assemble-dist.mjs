// Merges both app builds into one static tree mirroring how the Go backend serves them:
// user app at "/", admin app at "/admin/".
import { cpSync, existsSync, rmSync } from "node:fs"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("..", import.meta.url))
const out = `${root}dist`

for (const app of ["user", "admin"]) {
  if (!existsSync(`${root}apps/${app}/dist/index.html`)) {
    console.error(`apps/${app}/dist is missing — run "pnpm build" first.`)
    process.exit(1)
  }
}

rmSync(out, { recursive: true, force: true })
cpSync(`${root}apps/user/dist`, out, { recursive: true })
cpSync(`${root}apps/admin/dist`, `${out}/admin`, { recursive: true })
console.log("Assembled dist/ (user at /, admin at /admin/)")
