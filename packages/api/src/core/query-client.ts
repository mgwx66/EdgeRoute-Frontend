import { QueryClient } from "@tanstack/react-query"
import { isApiError } from "./errors"

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => failureCount < 2 && isApiError(error) && error.retryable,
      },
      mutations: {
        // Writes are never retried automatically; a duplicate write is worse than a visible error.
        retry: false,
      },
    },
  })
}
