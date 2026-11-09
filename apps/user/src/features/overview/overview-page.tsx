import { profileQuery } from "@edgeroute/api/user"
import { ModuleIcon } from "@edgeroute/ui/components/module-icon"
import { EmptyState } from "@edgeroute/ui/components/page-states"
import { GradientHeading } from "@edgeroute/ui/components/ui/gradient-heading"
import {
  TextureCardContent,
  TextureCardStyled,
} from "@edgeroute/ui/components/ui/texture-card"
import type { ModuleKey } from "@edgeroute/ui/lib/modules"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { m } from "motion/react"

const QUICK_START: { to: string; module: ModuleKey; title: string; description: string }[] = [
  { to: "/sites", module: "site", title: "接入第一个站点", description: "验证域名所有权并配置源站，几分钟即可开始加速。" },
  { to: "/certificates", module: "cert", title: "配置 HTTPS 证书", description: "上传已有证书，或使用 ACME 自动签发与续期。" },
  { to: "/cache", module: "cache", title: "刷新与预热缓存", description: "内容更新后按 URL 或目录刷新，发布前预热热点资源。" },
]

export function OverviewPage() {
  const user = useQuery(profileQuery).data?.user
  const name = user?.fullname || user?.username

  return (
    <>
      <section className="flex flex-col gap-1">
        <GradientHeading size="sm" weight="semi" className="pb-1">
          {name ? `欢迎回来，${name}` : "欢迎回来"}
        </GradientHeading>
        <p className="text-sm text-muted-foreground">从这里开始管理你的站点加速、缓存与账单。</p>
      </section>

      <section aria-labelledby="quick-start" className="flex flex-col gap-3">
        <h2 id="quick-start" className="text-sm font-medium text-muted-foreground">
          快速开始
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {QUICK_START.map((item, index) => (
            <m.li
              key={item.to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={item.to}
                className="group block rounded-[24px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <TextureCardStyled className="h-full transition-transform duration-200 group-hover:-translate-y-0.5">
                  <TextureCardContent className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-start justify-between">
                      <ModuleIcon module={item.module} size="lg" />
                      <ArrowUpRight
                        className="size-4 text-muted-foreground transition-colors group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground text-pretty">{item.description}</p>
                    </div>
                  </TextureCardContent>
                </TextureCardStyled>
              </Link>
            </m.li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="usage" className="flex flex-col gap-3">
        <h2 id="usage" className="text-sm font-medium text-muted-foreground">
          用量概览
        </h2>
        <EmptyState
          module="analytics"
          title="用量数据将在第二期接入"
          description="届时这里会展示本月流量、带宽峰值、请求数与安全事件，数据来自 GET /api/dashboard。"
        />
      </section>
    </>
  )
}
