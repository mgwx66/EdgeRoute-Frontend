/**
 * Mock "server" state. Handlers run in the page, so state is kept in localStorage to survive reloads
 * the way a real session cookie would. Dev-only; never bundled into production builds.
 */
export function createMockStore<T extends object>(key: string, initial: () => T) {
  const storageKey = `edgeroute-mock-${key}`

  function read(): T {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) return { ...initial(), ...(JSON.parse(raw) as Partial<T>) }
    } catch {
      // fall through to initial state
    }
    return initial()
  }

  return {
    get: read,
    patch(partial: Partial<T>) {
      const next = { ...read(), ...partial }
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    },
    reset() {
      localStorage.removeItem(storageKey)
    },
  }
}

export function randomToken(bytes = 24) {
  const array = new Uint8Array(bytes)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}
