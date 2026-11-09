import { z } from "zod/mini"

// Response contracts use zod/mini so the eager bundle only carries the validators it needs.

/** Boolean that falls back to `fallback` when the backend omits it. */
export const flag = (fallback: boolean) => z._default(z.boolean(), fallback)

/** String that falls back to "" when the backend omits it. */
export const text = () => z._default(z.string(), "")
