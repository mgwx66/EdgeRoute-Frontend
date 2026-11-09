import { delay } from "msw"

/**
 * Mock scenarios apply to business endpoints (never to session/login), so every page's four states
 * can be reviewed: `?scenario=empty|error|forbidden|slow` or the dev panel. Persisted per tab.
 */
export const SCENARIOS = ["normal", "empty", "error", "forbidden", "slow"] as const
export type Scenario = (typeof SCENARIOS)[number]

export const SCENARIO_LABELS: Record<Scenario, string> = {
  normal: "正常数据",
  empty: "空数据",
  error: "服务错误 (502)",
  forbidden: "无权限 (403)",
  slow: "慢响应 (2.5s)",
}

const STORAGE_KEY = "edgeroute-mock-scenario"

function isScenario(value: unknown): value is Scenario {
  return typeof value === "string" && (SCENARIOS as readonly string[]).includes(value)
}

export function initScenarioFromUrl() {
  if (typeof window === "undefined") return
  const fromUrl = new URLSearchParams(window.location.search).get("scenario")
  if (isScenario(fromUrl)) sessionStorage.setItem(STORAGE_KEY, fromUrl)
}

export function getScenario(): Scenario {
  if (typeof window === "undefined") return "normal"
  const stored = sessionStorage.getItem(STORAGE_KEY)
  return isScenario(stored) ? stored : "normal"
}

export function setScenario(scenario: Scenario) {
  sessionStorage.setItem(STORAGE_KEY, scenario)
}

/** Realistic latency for every mocked call; the slow scenario stretches it. */
export async function mockLatency() {
  await delay(getScenario() === "slow" ? 2500 : 180 + Math.round(Math.random() * 220))
}
