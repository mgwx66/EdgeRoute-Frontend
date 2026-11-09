import {
  Bot,
  ChartArea,
  FileCode2,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  Network,
  RefreshCw,
  ScrollText,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Split,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import type { CSSProperties } from "react"

export const MODULE_KEYS = [
  "overview",
  "site",
  "pages",
  "layer4",
  "cache",
  "analytics",
  "logs",
  "cert",
  "billing",
  "dns",
  "node",
  "security",
  "user",
  "support",
  "ai",
  "system",
] as const

export type ModuleKey = (typeof MODULE_KEYS)[number]

export interface ModuleMeta {
  key: ModuleKey
  label: string
  icon: LucideIcon
}

export const MODULES: Record<ModuleKey, ModuleMeta> = {
  overview: { key: "overview", label: "概览", icon: LayoutDashboard },
  site: { key: "site", label: "站点与加速", icon: Globe },
  pages: { key: "pages", label: "静态网站", icon: FileCode2 },
  layer4: { key: "layer4", label: "四层转发", icon: Split },
  cache: { key: "cache", label: "缓存", icon: RefreshCw },
  analytics: { key: "analytics", label: "统计", icon: ChartArea },
  logs: { key: "logs", label: "日志", icon: ScrollText },
  cert: { key: "cert", label: "证书", icon: ShieldCheck },
  billing: { key: "billing", label: "账单", icon: Wallet },
  dns: { key: "dns", label: "DNS", icon: Network },
  node: { key: "node", label: "节点", icon: Server },
  security: { key: "security", label: "WAF 与安全", icon: Shield },
  user: { key: "user", label: "用户", icon: Users },
  support: { key: "support", label: "消息与工单", icon: LifeBuoy },
  ai: { key: "ai", label: "AI 助手", icon: Bot },
  system: { key: "system", label: "系统", icon: Settings },
}

export function moduleVars(key: ModuleKey): CSSProperties {
  return {
    "--m-from": `var(--module-${key}-from)`,
    "--m-to": `var(--module-${key}-to)`,
  } as CSSProperties
}
