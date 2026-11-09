import { Button } from "@edgeroute/ui/components/ui/button"
import { Link } from "@tanstack/react-router"
import { Compass } from "lucide-react"

export function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Compass className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">页面不存在</h1>
        <p className="text-sm text-muted-foreground">你访问的地址不存在或已被移动。</p>
      </div>
      <Button asChild variant="outline">
        <Link to="/">返回管理平台</Link>
      </Button>
    </main>
  )
}
