import { Info, Lock, TriangleAlert, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@edgeroute/ui/lib/utils"

const TONES = {
  info: { className: "bg-info-soft text-info-soft-foreground", icon: Info },
  warning: { className: "bg-warning-soft text-warning-soft-foreground", icon: TriangleAlert },
  locked: { className: "bg-muted text-foreground", icon: Lock },
} satisfies Record<string, { className: string; icon: LucideIcon }>

export function GlobalBanner({ tone, children, action }: { tone: keyof typeof TONES; children: ReactNode; action?: ReactNode }) {
  const { className, icon: Icon } = TONES[tone]
  return (
    <div role="status" className={cn("flex items-center gap-2 border-b px-4 py-2 text-sm", className)}>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-pretty">{children}</p>
      {action}
    </div>
  )
}
