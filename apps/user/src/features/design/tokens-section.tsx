import { ModuleIcon } from "@edgeroute/ui/components/module-icon"
import { StatusBadge } from "@edgeroute/ui/components/status-badge"
import { MODULE_KEYS, MODULES } from "@edgeroute/ui/lib/modules"
import { DesignSection } from "./section"

const BRAND_SWATCHES = [
  { name: "primary", className: "bg-primary text-primary-foreground" },
  { name: "brand-soft", className: "bg-brand-soft text-brand-soft-foreground" },
  { name: "foreground", className: "bg-foreground text-background" },
  { name: "muted", className: "bg-muted text-muted-foreground" },
  { name: "surface-subtle", className: "bg-surface-subtle text-muted-foreground" },
] as const

const SEMANTIC_SWATCHES = [
  { name: "success", solid: "bg-success text-success-foreground", soft: "bg-success-soft text-success-soft-foreground" },
  { name: "warning", solid: "bg-warning text-warning-foreground", soft: "bg-warning-soft text-warning-soft-foreground" },
  { name: "destructive", solid: "bg-destructive text-destructive-foreground", soft: "bg-destructive-soft text-destructive-soft-foreground" },
  { name: "info", solid: "bg-info text-info-foreground", soft: "bg-info-soft text-info-soft-foreground" },
] as const

export function TokensSection() {
  return (
    <DesignSection
      id="tokens"
      title="色彩 token"
      description="品牌色用于主操作与焦点；语义色只表达状态，并且总是配合图标与文字；模块色只用于识别（图标底块、导航、图表默认系列），从不表达状态。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">品牌与中性色</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {BRAND_SWATCHES.map((s) => (
              <div key={s.name} className={`flex h-16 items-end rounded-lg border p-2 font-mono text-[11px] ${s.className}`}>
                {s.name}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">语义色（实色 / 浅底）</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SEMANTIC_SWATCHES.map((s) => (
              <div key={s.name} className="flex flex-col overflow-hidden rounded-lg border">
                <div className={`flex h-9 items-center px-2 font-mono text-[11px] ${s.solid}`}>{s.name}</div>
                <div className={`flex h-7 items-center px-2 font-mono text-[11px] ${s.soft}`}>soft</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="success">已生效</StatusBadge>
            <StatusBadge tone="warning">30 天内到期</StatusBadge>
            <StatusBadge tone="danger">已过期</StatusBadge>
            <StatusBadge tone="info">同步中</StatusBadge>
            <StatusBadge tone="neutral">已停用</StatusBadge>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">模块图标底块</h3>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {MODULE_KEYS.map((key) => (
            <li key={key} className="flex flex-col items-center gap-2 rounded-lg border bg-card px-2 py-4 text-center">
              <ModuleIcon module={key} size="lg" />
              <span className="text-xs font-medium">{MODULES[key].label}</span>
              <code className="font-mono text-[10px] text-muted-foreground">{key}</code>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>尺寸</span>
          <ModuleIcon module="site" size="sm" />
          <ModuleIcon module="site" size="md" />
          <ModuleIcon module="site" size="lg" />
        </div>
      </div>
    </DesignSection>
  )
}
