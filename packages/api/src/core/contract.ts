import type { z } from "zod/mini"
import { ApiError } from "./errors"

/**
 * Validates responses at the request boundary. In development a mismatch throws so contract drift is
 * caught early; in production the raw payload is passed through and the issue is only logged.
 */
export function parseContract<T extends z.ZodMiniType>(schema: T, data: unknown, endpoint: string): z.infer<T> {
  const result = schema.safeParse(data)
  if (result.success) return result.data
  if (import.meta.env.DEV) {
    throw new ApiError({
      kind: "contract",
      status: 200,
      message: `响应结构与约定不符：${endpoint}`,
      endpoint,
      raw: result.error.issues,
    })
  }
  console.warn("[api] contract mismatch", endpoint, result.error.issues)
  return data as z.infer<T>
}
