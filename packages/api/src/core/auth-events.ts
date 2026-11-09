export type AuthEvent = "unauthenticated" | "setup_required"

type Listener = (event: AuthEvent) => void

const listeners = new Set<Listener>()

export function onAuthEvent(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function emitAuthEvent(event: AuthEvent) {
  for (const listener of listeners) listener(event)
}
