import { describe, expect, it } from "vitest"
import { encodeAdminForm, pickDirty } from "./form"
import { normalizeMenus } from "./menus"

describe("encodeAdminForm", () => {
  it("omits undefined and null so the backend keeps current values", () => {
    expect(encodeAdminForm({ name: "a", isOn: undefined, limit: null }).toString()).toBe("name=a")
  })

  it("sends explicit false and 0", () => {
    expect(encodeAdminForm({ isOn: false, limit: 0 }).toString()).toBe("isOn=false&limit=0")
  })

  it("repeats keys for arrays and drops empty arrays", () => {
    const params = encodeAdminForm({ nodeIds: [1, 2, 3], tags: [] })
    expect(params.getAll("nodeIds")).toEqual(["1", "2", "3"])
    expect(params.has("tags")).toBe(false)
  })

  it("serializes objects as JSON strings for *JSON fields", () => {
    const params = encodeAdminForm({ httpJSON: { isOn: true, listen: [{ port: 80 }] } })
    expect(JSON.parse(params.get("httpJSON")!)).toEqual({ isOn: true, listen: [{ port: 80 }] })
  })
})

describe("pickDirty", () => {
  it("keeps only changed fields", () => {
    expect(pickDirty({ a: 1, b: false, c: "x" }, { b: true })).toEqual({ b: false })
  })
})

describe("normalizeMenus", () => {
  it("accepts string arrays, nested objects and boolean maps", () => {
    expect([...normalizeMenus(["Server", "node"])]).toEqual(["server", "node"])
    expect([...normalizeMenus([{ code: "finance", subItems: [{ code: "user" }] }, { code: "log", isOn: false }])]).toEqual([
      "finance",
      "user",
    ])
    expect([...normalizeMenus({ Setting: true, dns: false })]).toEqual(["setting"])
  })

  it("returns an empty set for missing menus", () => {
    expect(normalizeMenus(undefined).size).toBe(0)
  })
})
