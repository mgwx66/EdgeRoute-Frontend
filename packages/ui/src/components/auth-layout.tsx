import type { ReactNode } from "react"
import { BrandMark } from "@edgeroute/ui/components/app-shell"
import { ThemeToggle } from "@edgeroute/ui/components/theme-toggle"

export interface AuthLayoutProps {
  productName: string
  badge?: string
  title: string
  description?: ReactNode
  children: ReactNode
  aside?: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ productName, badge, title, description, children, aside, footer }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,var(--brand-soft),transparent)] opacity-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[48px_48px] opacity-40 mask-[radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
      />
      <header className="relative flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-sm font-semibold">{productName}</span>
          {badge ? <span className="rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">{badge}</span> : null}
        </div>
        <ThemeToggle />
      </header>
      <main className="relative flex flex-1 items-start justify-center px-4 pt-8 pb-16 sm:items-center sm:pt-0">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
            {description ? <p className="text-sm text-muted-foreground text-pretty">{description}</p> : null}
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">{children}</div>
          {aside}
        </div>
      </main>
      {footer ? <footer className="relative px-6 py-5 text-center text-xs text-muted-foreground">{footer}</footer> : null}
    </div>
  )
}
