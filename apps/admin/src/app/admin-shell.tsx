import { AppShell, type ShellLinkComponent } from "@edgeroute/ui/components/app-shell"
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router"
import { visibleAdminNav } from "./access"
import { useAdminLogout, useAdminSession } from "./use-session"

const ShellLink: ShellLinkComponent = ({ to, ...props }) => <Link to={to} {...props} />

export function AdminShell() {
  const session = useAdminSession()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const logout = useAdminLogout()
  const groups = visibleAdminNav(session)

  return (
    <AppShell
      brand={{ name: session.productName || "EdgeRoute", tagline: "管理平台" }}
      groups={groups}
      currentPath={pathname}
      LinkComponent={ShellLink}
      onNavigate={(to) => void navigate({ to })}
      account={{ name: session.admin?.name ?? "管理员", subtitle: session.isSuper ? "超级管理员" : "管理员" }}
      onLogout={() => logout.mutate()}
      headerSlot={
        session.showVersion && session.version ? (
          <span className="hidden rounded-full border px-2 py-0.5 font-mono text-[11px] text-muted-foreground lg:inline">v{session.version}</span>
        ) : null
      }
    >
      <Outlet />
    </AppShell>
  )
}
