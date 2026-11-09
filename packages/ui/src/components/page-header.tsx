import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { ModuleIcon } from "@edgeroute/ui/components/module-icon"
import type { ModuleKey } from "@edgeroute/ui/lib/modules"
import { cn } from "@edgeroute/ui/lib/utils"

export interface PageHeaderProps {
  module: ModuleKey
  icon?: LucideIcon
  title: string
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ module, icon, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex min-w-0 items-center gap-3">
        <ModuleIcon module={module} icon={icon} size="lg" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="truncate text-xl font-semibold tracking-tight text-balance">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground text-pretty">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
