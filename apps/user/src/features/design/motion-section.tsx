import { ModuleIcon } from "@edgeroute/ui/components/module-icon"
import { Button } from "@edgeroute/ui/components/ui/button"
import { RollingNumber } from "@edgeroute/ui/components/ui/rolling-number"
import { TextureCardContent, TextureCardStyled } from "@edgeroute/ui/components/ui/texture-card"
import { formatInteger } from "@edgeroute/ui/lib/format"
import { Shuffle } from "lucide-react"
import { useState } from "react"
import { DesignSection } from "./section"

const KPIS = [
  { key: "requests", label: "今日请求数", module: "analytics", seed: 1_284_903 },
  { key: "sites", label: "在线站点", module: "site", seed: 42 },
  { key: "blocked", label: "已拦截攻击", module: "security", seed: 18_342 },
] as const

export function MotionSection() {
  const [factor, setFactor] = useState(1)
  return (
    <DesignSection
      id="motion"
      title="动效（仅概览、空状态、关键反馈）"
      description="Cult UI RollingNumber 与 TextureCard 只用于概览类页面；全局 MotionConfig 跟随系统的「减少动态效果」设置，开启后数字直接跳到目标值。以下为界面示例数据。"
    >
      <div className="flex flex-col gap-4">
        <ul className="grid gap-4 md:grid-cols-3">
          {KPIS.map((kpi) => (
            <li key={kpi.key}>
              <TextureCardStyled>
                <TextureCardContent className="flex items-center gap-4 p-5">
                  <ModuleIcon module={kpi.module} size="lg" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{kpi.label}</span>
                    <span className="text-2xl font-semibold tabular-nums">
                      <RollingNumber value={Math.round(kpi.seed * factor)} format={formatInteger} />
                    </span>
                  </div>
                </TextureCardContent>
              </TextureCardStyled>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="w-fit" onClick={() => setFactor(0.6 + Math.random() * 0.8)}>
          <Shuffle className="size-4" aria-hidden="true" />
          刷新示例数值
        </Button>
      </div>
    </DesignSection>
  )
}
