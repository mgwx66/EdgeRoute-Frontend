import type { LucideIcon } from "lucide-react"
import { PageHeader } from "@edgeroute/ui/components/page-header"
import { EmptyState } from "@edgeroute/ui/components/page-states"
import type { ModuleKey } from "@edgeroute/ui/lib/modules"

export interface PlannedPageProps {
  id: string
  module: ModuleKey
  icon?: LucideIcon
  title: string
  description: string
  phase: string
  apis: string[]
}

/** Placeholder for routes whose shell, navigation and guard exist but whose page ships in a later phase. */
export function PlannedPage({ id, module, icon, title, description, phase, apis }: PlannedPageProps) {
  return (
    <>
      <PageHeader module={module} icon={icon} title={title} description={description} />
      <EmptyState
        module={module}
        icon={icon}
        title={`该页面将在${phase}实现`}
        description="外壳、导航、权限守卫与请求层已就绪，业务页面将按设计方案逐页交付。"
      />
      {apis.length > 0 ? (
        <section aria-labelledby={`${id}-apis`} className="flex flex-col gap-3">
          <h2 id={`${id}-apis`} className="text-sm font-medium text-muted-foreground">
            将对接的接口
          </h2>
          <ul className="flex flex-wrap gap-2">
            {apis.map((api) => (
              <li key={api}>
                <code className="rounded-md border bg-surface-subtle px-2 py-1 font-mono text-xs">{api}</code>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}
