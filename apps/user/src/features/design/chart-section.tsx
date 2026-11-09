import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@edgeroute/ui/components/ui/chart"
import { formatBytes } from "@edgeroute/ui/lib/format"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { DesignSection } from "./section"

const GB = 1024 ** 3

const DATA = Array.from({ length: 14 }, (_, i) => {
  const base = 40 + Math.sin(i / 2) * 12 + i * 1.6
  return { day: `11-${String(i + 1).padStart(2, "0")}`, hit: base * GB, miss: (base * 0.22 + (i % 3) * 2) * GB }
})

const config = {
  hit: { label: "缓存命中", color: "var(--chart-1)" },
  miss: { label: "回源", color: "var(--chart-2)" },
} satisfies ChartConfig

export function ChartSection() {
  return (
    <DesignSection
      id="chart"
      title="图表主题"
      description="shadcn Charts（Recharts）直接读取 --chart-1…5，亮暗主题自动切换；坐标轴使用格式化后的单位，tooltip 与图例必备。以下为界面示例数据。"
    >
      <div className="rounded-lg border bg-card p-5">
        <div className="mb-4 flex flex-col gap-0.5">
          <h3 className="text-sm font-medium">流量构成（示例）</h3>
          <p className="text-xs text-muted-foreground">近 14 天 · 按日汇总</p>
        </div>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <AreaChart data={DATA} margin={{ left: 4, right: 8, top: 4 }}>
            <defs>
              {(["hit", "miss"] as const).map((key) => (
                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => formatBytes(v, 0)} />
            <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => `${config[name as keyof typeof config]?.label ?? name}：${formatBytes(Number(value))}`} />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area dataKey="miss" type="monotone" stackId="a" stroke="var(--color-miss)" fill="url(#fill-miss)" strokeWidth={1.5} />
            <Area dataKey="hit" type="monotone" stackId="a" stroke="var(--color-hit)" fill="url(#fill-hit)" strokeWidth={1.5} />
          </AreaChart>
        </ChartContainer>
      </div>
    </DesignSection>
  )
}
