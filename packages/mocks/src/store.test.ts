import { afterEach, describe, expect, it, vi } from "vitest"
import { createMockStore, randomToken } from "./store"

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, v),
  }
}

function blockedStorage(): Storage {
  const deny = () => {
    throw new DOMException("denied", "SecurityError")
  }
  return { length: 0, clear: deny, getItem: deny, key: deny, removeItem: deny, setItem: deny }
}

const newStore = () => createMockStore("test", () => ({ csrfToken: randomToken(), authenticated: false }))

afterEach(() => vi.unstubAllGlobals())

describe("createMockStore", () => {
  it("returns a stable token before any write (fresh browser)", () => {
    vi.stubGlobal("localStorage", memoryStorage())
    const store = newStore()
    const first = store.get().csrfToken
    expect(store.get().csrfToken).toBe(first)
    expect(store.get().csrfToken).toBe(first)
  })

  it("stays consistent when storage is blocked", () => {
    vi.stubGlobal("localStorage", blockedStorage())
    const store = newStore()
    const token = store.get().csrfToken
    expect(store.get().csrfToken).toBe(token)
    store.patch({ authenticated: true })
    expect(store.get()).toEqual({ csrfToken: token, authenticated: true })
  })

  it("survives a reload via storage and resets cleanly", () => {
    const storage = memoryStorage()
    vi.stubGlobal("localStorage", storage)
    const token = newStore().patch({ authenticated: true }).csrfToken
    const reloaded = newStore()
    expect(reloaded.get()).toEqual({ csrfToken: token, authenticated: true })
    reloaded.reset()
    expect(reloaded.get().csrfToken).not.toBe(token)
  })
})
