/** Normalized list result shared by offset/size, page/size and cursor endpoints. */
export interface PageResult<T> {
  items: T[]
  total?: number
  page?: number
  size?: number
  nextCursor?: string
}

export const USER_PAGE_LIMITS = { maxOffset: 1_000_000, minSize: 1, maxSize: 100, defaultSize: 20 } as const
export const ADMIN_PAGE_LIMITS = { minSize: 1, maxSize: 100, defaultSize: 20 } as const

/** User endpoints reject out-of-range offset/size with 400, so clamp before sending. */
export function toOffsetParams(page: number, size: number = USER_PAGE_LIMITS.defaultSize) {
  const safeSize = Math.min(Math.max(Math.trunc(size), USER_PAGE_LIMITS.minSize), USER_PAGE_LIMITS.maxSize)
  const safePage = Math.max(1, Math.trunc(page))
  const offset = Math.min((safePage - 1) * safeSize, USER_PAGE_LIMITS.maxOffset)
  return { offset, size: safeSize }
}

export function toAdminPageParams(page: number, size: number = ADMIN_PAGE_LIMITS.defaultSize) {
  return {
    page: Math.max(1, Math.trunc(page)),
    size: Math.min(Math.max(Math.trunc(size), ADMIN_PAGE_LIMITS.minSize), ADMIN_PAGE_LIMITS.maxSize),
  }
}

export function createIdempotencyKey() {
  return crypto.randomUUID()
}
