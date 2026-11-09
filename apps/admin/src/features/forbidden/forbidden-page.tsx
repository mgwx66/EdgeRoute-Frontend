import { NoAccessState } from "@edgeroute/ui/components/page-states"
import { Button } from "@edgeroute/ui/components/ui/button"
import { getRouteApi, Link } from "@tanstack/react-router"
import { firstAccessiblePath } from "@/app/access"
import { useAdminSession } from "@/app/use-session"

const route = getRouteApi("/app/forbidden")

export function ForbiddenPage() {
  const { from } = route.useSearch()
  const session = useAdminSession()
  const home = firstAccessiblePath(session)
  return (
    <div className="flex flex-1 flex-col justify-center">
      <NoAccessState
        reason="permission"
        actions={
          home ? (
            <Button asChild variant="outline" size="sm">
              <Link to={home}>返回可访问的页面</Link>
            </Button>
          ) : null
        }
      />
      {from ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          请求的地址：<code className="font-mono">{from}</code>
        </p>
      ) : null}
    </div>
  )
}
