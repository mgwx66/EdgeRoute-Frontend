/**
 * Mock "server" state. Handlers run in the page, so state is kept in localStorage to survive reloads
 * the way a real session cookie would. Never bundled into production builds.
 *
 * The initial state is materialised once and cached: `initial()` generates random tokens, so calling
 * it per read would hand out a different CSRF token on every request. An in-memory copy also keeps
 * the mock consistent when storage is unavailable (e.g. partitioned or blocked in an iframe).
 */
export function createMockStore<T extends object>(key: string, initial: () => T) {
  const storageKey = `edgeroute-mock-${key}`
  let memory: T | null = null

  function persist(state: T) {
    memory = state
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      // storage unavailable; the in-memory copy stays authoritative for this page
    }
  }

  function read(): T {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        memory = { ...initial(), ...(JSON.parse(raw) as Partial<T>) }
        return memory
      }
    } catch {
      // fall through to the in-memory copy
    }
    if (!memory) persist(initial())
    return memory as T
  }

  return {
    get: read,
    patch(partial: Partial<T>) {
      const next = { ...read(), ...partial }
      persist(next)
      return next
    },
    reset() {
      memory = null
      try {
        localStorage.removeItem(storageKey)
      } catch {
        // nothing persisted
      }
    },
  }
}

export function randomToken(bytes = 24) {
  const array = new Uint8Array(bytes)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}
