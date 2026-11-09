import { ModuleIcon } from "@edgeroute/ui/components/module-icon"
import { EmptyState } from "@edgeroute/ui/components/page-states"
import { GradientHeading } from "@edgeroute/ui/components/ui/gradient-heading"
import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { m } from "motion/react"
import { visibleAdminNav } from "@/app/access"
import { useAdminSession } from "@/app/use-session"

export function DashboardPage() {
  const session = useAdminSession()
  const entries = visibleAdminNav(session)
    .flatMap((g) => g.items)
    .filter((item) => item.to !== "/")

  return (
    <>
      <section className="flex flex-col gap-1">
        <GradientHeading size="sm" weight="semi" className="pb-1">
          {session.admin?.name ? `你好，${session.admin.name}` : "仪表盘"}
        </GradientHeading>
        <p className="text-sm text-muted-foreground">
          你当前可访问 {entries.length} 个管理模块。导航与路由均由会话下发的菜单权限决定。
        </p>
      </section>

      <section aria-labelledby="modules" className="flex flex-col gap-3">
        <h2 id="modules" className="text-sm font-medium text-muted-foreground">
          可访问的模块
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {entries.map((item, index) => (
            <m.li
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.03, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={item.to}
                className="group flex h-full items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <ModuleIcon module={item.module} icon={item.icon} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground text-pretty">{item.description}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
              </Link>
            </m.li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="stats" className="flex flex-col gap-3">
        <h2 id="stats" className="text-sm font-medium text-muted-foreground">
          运行数据
        </h2>
        <EmptyState
          module="overview"
          title="运行数据将在第三期接入"
          description="届时这里会展示网站、集群、节点与用户计数，今日流量、访问日志队列与热门域名，数据来自 GET /api/admin/dashboard。"
        />
      </section>
    </>
  )
}
