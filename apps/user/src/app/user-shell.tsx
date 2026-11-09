import { portalQuery, profileQuery } from "@edgeroute/api/user"
import { AppShell, type ShellLinkComponent } from "@edgeroute/ui/components/app-shell"
import { GlobalBanner } from "@edgeroute/ui/components/global-banner"
import { DropdownMenuItem } from "@edgeroute/ui/components/ui/dropdown-menu"
import { useQuery } from "@tanstack/react-query"
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router"
import { UserCog } from "lucide-react"
import { visibleUserNav } from "./nav"
import { useLogout, useSaveTheme, useUserSession } from "./use-session"

const ShellLink: ShellLinkComponent = ({ to, ...props }) => <Link to={to} {...props} />

export function UserShell() {
  const session = useUserSession()
  const portal = useQuery(portalQuery).data
  const profile = useQuery(profileQuery).data
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const logout = useLogout()
  const saveTheme = useSaveTheme()

  const groups = visibleUserNav({ showFinance: portal?.showFinance ?? false, includeDesign: import.meta.env.DEV })
  const user = profile?.user
  const productName = portal?.productName || "EdgeRoute"

  return (
    <AppShell
      brand={{ name: productName, tagline: "CDN 控制台" }}
      groups={groups}
      currentPath={pathname}
      LinkComponent={ShellLink}
      onNavigate={(to) => void navigate({ to })}
      account={{ name: user?.fullname || user?.username || "我的账户", subtitle: user?.email }}
      accountMenu={
        <DropdownMenuItem onSelect={() => void navigate({ to: "/account" })}>
          <UserCog className="size-4" aria-hidden="true" />
          账户设置
        </DropdownMenuItem>
      }
      onLogout={() => logout.mutate()}
      onThemeChange={saveTheme}
      banners={
        <>
          {session.impersonated ? (
            <GlobalBanner tone="warning">你正处于管理员协助会话，所有敏感写操作已被禁用。</GlobalBanner>
          ) : null}
          {session.licenseReadOnly ? (
            <GlobalBanner tone="locked">平台授权已失效，当前为只读模式，暂时无法修改任何配置。</GlobalBanner>
          ) : null}
        </>
      }
    >
      <Outlet />
    </AppShell>
  )
}
