import { AlertTriangle, CheckCircle2, CircleDashed, Info, XCircle, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@edgeroute/ui/lib/utils"

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral"

const TONES: Record<StatusTone, { className: string; icon: LucideIcon }> = {
  success: { className: "bg-success-soft text-success-soft-foreground", icon: CheckCircle2 },
  warning: { className: "bg-warning-soft text-warning-soft-foreground", icon: AlertTriangle },
  danger: { className: "bg-destructive-soft text-destructive-soft-foreground", icon: XCircle },
  info: { className: "bg-info-soft text-info-soft-foreground", icon: Info },
  neutral: { className: "bg-muted text-muted-foreground", icon: CircleDashed },
}

/** Status is always communicated by tone + icon + text, never by color alone. */
export function StatusBadge({ tone, children, className }: { tone: StatusTone; children: ReactNode; className?: string }) {
  const { className: toneClass, icon: Icon } = TONES[tone]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        toneClass,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </span>
  )
}
