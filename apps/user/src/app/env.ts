/**
 * Mocks run in development when no real backend target is configured, and in demo builds
 * (Vercel preview deployments) which have no backend at all.
 */
export const MOCK_ENABLED =
  (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== "false" && !import.meta.env.VITE_API_TARGET) ||
  import.meta.env.VITE_DEMO_MOCKS === "true"
