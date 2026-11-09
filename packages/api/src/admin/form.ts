/**
 * Admin endpoints read only query strings and urlencoded forms. Encoding rules:
 * - `undefined` / `null` → key omitted (backend keeps the current value)
 * - boolean → "true" / "false"; number → decimal string
 * - array of scalars → repeated keys; an empty array produces no key, so callers that need to clear a
 *   list must also send the endpoint's "whole-block submit" flag field
 * - plain object → JSON string (for `*JSON` fields)
 */
export type FormScalar = string | number | boolean
export type FormValue = FormScalar | null | undefined | ReadonlyArray<FormScalar> | Record<string, unknown>
export type FormFields = Record<string, FormValue>

function scalarToString(value: FormScalar) {
  return typeof value === "boolean" ? (value ? "true" : "false") : String(value)
}

export function encodeAdminForm(fields: FormFields): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value as ReadonlyArray<FormScalar>) params.append(key, scalarToString(item))
      continue
    }
    if (typeof value === "object") {
      params.append(key, JSON.stringify(value))
      continue
    }
    params.append(key, scalarToString(value as FormScalar))
  }
  return params
}

/** Keeps only fields the user actually changed (react-hook-form `dirtyFields`), for partial updates. */
export function pickDirty<T extends Record<string, unknown>>(values: T, dirty: Partial<Record<keyof T, unknown>>): Partial<T> {
  const result: Partial<T> = {}
  for (const key of Object.keys(dirty) as (keyof T)[]) {
    if (dirty[key]) result[key] = values[key]
  }
  return result
}
