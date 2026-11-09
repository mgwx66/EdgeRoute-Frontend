/** Mocks run only in development, and only when no real backend target is configured. */
export const MOCK_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== "false" && !import.meta.env.VITE_API_TARGET
