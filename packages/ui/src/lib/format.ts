const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const
const BIT_RATE_UNITS = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"] as const

function scale(value: number, base: number, units: readonly string[], digits: number) {
  if (!Number.isFinite(value) || value <= 0) return `0 ${units[0]}`
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(base)), units.length - 1)
  const scaled = value / base ** exponent
  return `${scaled.toFixed(exponent === 0 ? 0 : digits)} ${units[exponent]}`
}

export function formatBytes(bytes: number, digits = 2) {
  return scale(bytes, 1024, BYTE_UNITS, digits)
}

export function formatBitRate(bitsPerSecond: number, digits = 2) {
  return scale(bitsPerSecond, 1000, BIT_RATE_UNITS, digits)
}

const integerFormatter = new Intl.NumberFormat("zh-CN")
const compactFormatter = new Intl.NumberFormat("zh-CN", { notation: "compact", maximumFractionDigits: 1 })

export function formatInteger(value: number) {
  return integerFormatter.format(value)
}

export function formatCompact(value: number) {
  return compactFormatter.format(value)
}

export function formatPercent(ratio: number, digits = 1) {
  return `${(ratio * 100).toFixed(digits)}%`
}
