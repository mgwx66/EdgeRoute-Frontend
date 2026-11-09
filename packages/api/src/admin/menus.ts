/**
 * The shape of `session.menus` is not documented yet. Until it is, accept any of:
 * - `["server", "node"]`
 * - `[{ code: "server", subItems?: [...] }]` (also `module`, `id`, `key`; children in `subItems`/`items`/`children`)
 * - `{ server: true, node: false }`
 * Codes are lower-cased so `Server` and `server` match the route registry.
 */
export function normalizeMenus(raw: unknown): Set<string> {
  const codes = new Set<string>()

  const visit = (node: unknown) => {
    if (typeof node === "string") {
      if (node) codes.add(node.toLowerCase())
      return
    }
    if (Array.isArray(node)) {
      node.forEach(visit)
      return
    }
    if (!node || typeof node !== "object") return
    const record = node as Record<string, unknown>
    const code = [record.code, record.module, record.id, record.key].find((v): v is string => typeof v === "string")
    if (code) {
      if (record.isOn !== false) codes.add(code.toLowerCase())
      for (const childKey of ["subItems", "items", "children"]) {
        if (Array.isArray(record[childKey])) visit(record[childKey])
      }
      return
    }
    for (const [key, value] of Object.entries(record)) {
      if (value === true) codes.add(key.toLowerCase())
    }
  }

  visit(raw)
  return codes
}
