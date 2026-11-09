import { ChevronsUpDown, LogOut, Search, type LucideIcon } from "lucide-react"
import { useEffect, useState, type ComponentProps, type ComponentType, type ReactNode } from "react"
import { ModuleIcon } from "@edgeroute/ui/components/module-icon"
import { ThemeToggle, type ThemePreference } from "@edgeroute/ui/components/theme-toggle"
import { Avatar, AvatarFallback } from "@edgeroute/ui/components/ui/avatar"
import { Button } from "@edgeroute/ui/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@edgeroute/ui/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@edgeroute/ui/components/ui/dropdown-menu"
import { Separator } from "@edgeroute/ui/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@edgeroute/ui/components/ui/sidebar"
import { moduleVars, type ModuleKey } from "@edgeroute/ui/lib/modules"
import { cn } from "@edgeroute/ui/lib/utils"

export interface ShellNavItem {
  id: string
  label: string
  to: string
  module: ModuleKey
  icon?: LucideIcon
  keywords?: string[]
}

export interface ShellNavGroup {
  id: string
  label?: string
  items: ShellNavItem[]
}

/** Router-agnostic link; must spread remaining props so `asChild` slots can attach data/aria attributes. */
export type ShellLinkComponent = ComponentType<{ to: string } & Omit<ComponentProps<"a">, "href">>

export interface AppShellProps {
  brand: { name: string; tagline: string }
  groups: ShellNavGroup[]
  currentPath: string
  LinkComponent: ShellLinkComponent
  onNavigate: (to: string) => void
  account: { name: string; subtitle?: string }
  accountMenu?: ReactNode
  onLogout: () => void
  onThemeChange?: (theme: ThemePreference) => void
  banners?: ReactNode
  headerSlot?: ReactNode
  children: ReactNode
}

function isActive(currentPath: string, to: string) {
  if (to === "/") return currentPath === "/"
  return currentPath === to || currentPath.startsWith(`${to}/`)
}

export function AppShell({
  brand,
  groups,
  currentPath,
  LinkComponent,
  onNavigate,
  account,
  accountMenu,
  onLogout,
  onThemeChange,
  banners,
  headerSlot,
  children,
}: AppShellProps) {
  const [commandOpen, setCommandOpen] = useState(false)
  const allItems = groups.flatMap((g) => g.items)
  const current = allItems
    .filter((item) => isActive(currentPath, item.to))
    .sort((a, b) => b.to.length - a.to.length)[0]

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="h-14 justify-center border-b">
          <div className="flex items-center gap-2.5 px-1 group-data-[collapsible=icon]:px-0">
            <BrandMark />
            <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold">{brand.name}</span>
              <span className="truncate text-xs text-muted-foreground">{brand.tagline}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="py-2">
          {groups.map((group) => (
            <SidebarGroup key={group.id} className="py-1">
              {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = current?.id === item.id
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <LinkComponent to={item.to}>
                            <ModuleIcon module={item.module} icon={item.icon} size="sm" className="-ml-1 group-data-[collapsible=icon]:ml-0" />
                            <span>{item.label}</span>
                          </LinkComponent>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-brand-soft text-xs font-semibold text-brand-soft-foreground">
                        {account.name.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col text-left leading-tight">
                      <span className="truncate text-sm font-medium">{account.name}</span>
                      {account.subtitle ? <span className="truncate text-xs text-muted-foreground">{account.subtitle}</span> : null}
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="text-sm">{account.name}</span>
                    {account.subtitle ? <span className="text-xs font-normal text-muted-foreground">{account.subtitle}</span> : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {accountMenu}
                  {accountMenu ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuItem onSelect={onLogout}>
                    <LogOut className="size-4" aria-hidden="true" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-w-0">
        {banners}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" aria-label="切换侧栏" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          <nav aria-label="面包屑" className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{brand.name}</span>
            {current ? (
              <>
                <span className="hidden text-muted-foreground sm:inline" aria-hidden="true">
                  /
                </span>
                <span className="truncate font-medium" aria-current="page">
                  {current.label}
                </span>
              </>
            ) : null}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            {headerSlot}
            <Button
              variant="outline"
              size="sm"
              className="hidden h-8 w-56 justify-start gap-2 text-muted-foreground md:flex"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="size-4" aria-hidden="true" />
              <span className="flex-1 text-left">搜索页面…</span>
              <kbd className="pointer-events-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">⌘K</kbd>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="搜索页面" onClick={() => setCommandOpen(true)}>
              <Search className="size-4" aria-hidden="true" />
            </Button>
            <ThemeToggle onChange={onThemeChange} />
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">{children}</div>
      </SidebarInset>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} title="搜索页面" description="输入页面名称快速跳转">
        <CommandInput placeholder="输入页面名称…" />
        <CommandList>
          <CommandEmpty>没有匹配的页面</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group.id} heading={group.label ?? "常用"}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.to} ${(item.keywords ?? []).join(" ")}`}
                  onSelect={() => {
                    setCommandOpen(false)
                    onNavigate(item.to)
                  }}
                >
                  <ModuleIcon module={item.module} icon={item.icon} size="sm" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  )
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("module-tile inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-white", className)}
      style={moduleVars("overview")}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 17 L10 7 L14 13 L20 5" />
        <circle cx="20" cy="5" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    </span>
  )
}
