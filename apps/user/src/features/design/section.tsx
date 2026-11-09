import type { ReactNode } from "react"

export function DesignSection({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 border-b pb-10 last:border-b-0">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="text-base font-semibold">
          {title}
        </h2>
        {description ? <p className="max-w-3xl text-sm text-muted-foreground text-pretty">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}
