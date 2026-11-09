import { AlertTriangle, BadgeCheck, Lock, RotateCw, Sparkles, type LucideIcon } from "lucide-react"
import { m } from "motion/react"
import type { ReactNode } from "react"
import { ModuleIcon } from "@edgeroute/ui/components/module-icon"
import { Button } from "@edgeroute/ui/components/ui/button"
import { Skeleton } from "@edgeroute/ui/components/ui/skeleton"
import type { ModuleKey } from "@edgeroute/ui/lib/modules"
import { cn } from "@edgeroute/ui/lib/utils"

type LoadingVariant = "table" | "cards" | "chart" | "form"

export function LoadingState({ variant = "table", rows = 8, className }: { variant?: LoadingVariant; rows?: number; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col gap-3", className)}>
      <span className="sr-only">正在加载</span>
      {variant === "table" && (
        <div className="overflow-hidden rounded-lg border">
          <div className="flex gap-4 border-b bg-surface-subtle px-4 py-3">
            {[40, 24, 16, 20].map((w, i) => (
              <Skeleton key={i} className="h-3" style={{ width: `${w}%` }} />
            ))}
          </div>
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-b-0">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3.5 w-1/4" />
              <Skeleton className="h-3.5 w-1/6" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      )}
      {variant === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-xl border p-5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      )}
      {variant === "chart" && (
        <div className="flex flex-col gap-4 rounded-xl border p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}
      {variant === "form" && (
        <div className="flex max-w-xl flex-col gap-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface StateFrameProps {
  visual: ReactNode
  title: string
  description?: ReactNode
  actions?: ReactNode
  animated?: boolean
  className?: string
  role?: "status" | "alert"
}

function StateFrame({ visual, title, description, actions, animated, className, role }: StateFrameProps) {
  const content = (
    <>
      {visual}
      <div className="flex max-w-md flex-col gap-1.5">
        <h2 className="text-base font-semibold text-balance">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground text-pretty">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center justify-center gap-2">{actions}</div> : null}
    </>
  )
  const base = cn(
    "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-surface-subtle px-6 py-14 text-center",
    className,
  )
  if (!animated) {
    return (
      <div role={role} className={base}>
        {content}
      </div>
    )
  }
  return (
    <m.div
      role={role}
      className={base}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </m.div>
  )
}

export interface EmptyStateProps {
  module: ModuleKey
  icon?: LucideIcon
  title: string
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

export function EmptyState({ module, icon, title, description, actions, className }: EmptyStateProps) {
  return (
    <StateFrame
      animated
      className={className}
      visual={<ModuleIcon module={module} icon={icon} size="lg" />}
      title={title}
      description={description}
      actions={actions}
    />
  )
}

export interface ErrorStateProps {
  title?: string
  message?: ReactNode
  hint?: ReactNode
  onRetry?: () => void
  retrying?: boolean
  className?: string
}

export function ErrorState({ title = "加载失败", message, hint, onRetry, retrying, className }: ErrorStateProps) {
  return (
    <StateFrame
      role="alert"
      className={cn("border-solid border-destructive/25 bg-destructive-soft/40", className)}
      visual={
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-destructive-soft text-destructive-soft-foreground">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
      }
      title={title}
      description={
        <>
          {message}
          {hint ? <span className="mt-1 block text-xs">{hint}</span> : null}
        </>
      }
      actions={
        onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry} disabled={retrying}>
            <RotateCw className={cn("size-4", retrying && "animate-spin")} aria-hidden="true" />
            重试
          </Button>
        ) : null
      }
    />
  )
}

export type NoAccessReason = "permission" | "plan" | "identity" | "readonly"

const NO_ACCESS_COPY: Record<NoAccessReason, { icon: LucideIcon; title: string; description: string }> = {
  permission: { icon: Lock, title: "没有访问权限", description: "当前账号没有该模块的权限，如需开通请联系超级管理员。" },
  plan: { icon: Sparkles, title: "当前套餐不包含此功能", description: "升级套餐后即可使用该功能。" },
  identity: { icon: BadgeCheck, title: "需要完成实名认证", description: "根据平台要求，完成实名认证后才能使用该功能。" },
  readonly: { icon: Lock, title: "平台处于只读模式", description: "平台授权已失效，暂时只能查看数据，无法修改。" },
}

export function NoAccessState({ reason = "permission", actions, className }: { reason?: NoAccessReason; actions?: ReactNode; className?: string }) {
  const copy = NO_ACCESS_COPY[reason]
  const Icon = copy.icon
  return (
    <StateFrame
      className={className}
      visual={
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      }
      title={copy.title}
      description={copy.description}
      actions={actions}
    />
  )
}
