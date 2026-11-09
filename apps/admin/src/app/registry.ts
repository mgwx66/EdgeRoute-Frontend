import type { ShellNavGroup, ShellNavItem } from "@edgeroute/ui/components/app-shell"
import {
  Bell,
  Boxes,
  Database,
  FolderTree,
  KeyRound,
  Lock,
  MonitorSmartphone,
  Network,
  ReceiptText,
  ServerCog,
  ShieldUser,
  Ticket,
  Wrench,
} from "lucide-react"

/**
 * Admin permission module codes, lower-cased (AdminModuleCode*). Per the API docs:
 * common: dashboard, /api/metrics · server: sites, certs/ACME, WAF/IP/cache, access logs, security overview
 * node: node/cluster writes · dns · log: audit logs · finance · user · admin: admins, notifications
 * ticket · setting: settings, messages, maintenance. `superOnly` marks super-admin-only areas.
 */
export type AdminPermission = "common" | "server" | "node" | "dns" | "log" | "finance" | "user" | "admin" | "ticket" | "setting"

export interface AdminRouteEntry extends ShellNavItem {
  permission: AdminPermission
  superOnly?: boolean
  description: string
  apis: string[]
}

export interface AdminNavGroup extends ShellNavGroup {
  items: AdminRouteEntry[]
}

export const ADMIN_REGISTRY: AdminNavGroup[] = [
  {
    id: "overview",
    items: [
      { id: "dashboard", label: "仪表盘", to: "/", module: "overview", permission: "common", description: "平台整体运行状态。", apis: ["GET /api/admin/dashboard"] },
      { id: "security-overview", label: "安全概览", to: "/security-overview", module: "security", permission: "server", description: "WAF、威胁 IP、API 发现与事件历史。", apis: ["GET /api/admin/security-overview", "GET/POST /api/admin/security-events/notifications"] },
    ],
  },
  {
    id: "sites",
    label: "网站",
    items: [
      { id: "sites", label: "网站列表", to: "/sites", module: "site", permission: "server", keywords: ["域名", "站点"], description: "全部用户网站的配置与状态。", apis: ["/api/admin/sites*"] },
      { id: "server-groups", label: "网站分组", to: "/server-groups", module: "site", icon: FolderTree, permission: "server", description: "网站分组与排序。", apis: ["/api/admin/server-groups*"] },
      { id: "tls-baseline", label: "TLS 基线", to: "/tls-baseline", module: "cert", icon: Lock, permission: "server", description: "审计站点 HTTPS 的 TLS 基线问题。", apis: ["GET /api/admin/security/tls-baseline"] },
    ],
  },
  {
    id: "nodes",
    label: "节点",
    items: [
      { id: "clusters", label: "集群", to: "/clusters", module: "node", icon: Boxes, permission: "node", description: "集群策略、DNS 与发布批次。", apis: ["/api/admin/clusters*"] },
      { id: "nodes", label: "边缘节点", to: "/nodes", module: "node", permission: "node", keywords: ["节点", "安装"], description: "节点详情、远程安装与运行状态。", apis: ["/api/admin/nodes/*"] },
      { id: "user-nodes", label: "用户节点", to: "/user-nodes", module: "node", icon: MonitorSmartphone, permission: "node", description: "用户自建节点。", apis: ["/api/admin/user-nodes*"] },
      { id: "dns", label: "DNS", to: "/dns", module: "dns", icon: Network, permission: "dns", description: "DNS 服务商、域名与集群解析。", apis: ["/api/admin/dns/*"] },
    ],
  },
  {
    id: "security",
    label: "证书与安全",
    items: [
      { id: "certificates", label: "证书", to: "/certificates", module: "cert", permission: "server", keywords: ["SSL", "ACME"], description: "证书、ACME 任务、账户与用户。", apis: ["/api/admin/certificates*", "/api/admin/acme/*"] },
      { id: "waf", label: "WAF 策略", to: "/waf", module: "security", permission: "server", description: "防火墙策略、规则分组与规则集。", apis: ["/api/admin/waf/*"] },
      { id: "ip-lists", label: "IP 名单", to: "/ip-lists", module: "security", icon: ShieldUser, permission: "server", description: "全局 IP 黑白名单。", apis: ["/api/admin/ip-lists*"] },
      { id: "cache", label: "缓存", to: "/cache", module: "cache", permission: "server", keywords: ["刷新", "预热", "缓存策略"], description: "缓存策略与刷新预热任务。", apis: ["/api/admin/cache/*"] },
    ],
  },
  {
    id: "logs",
    label: "日志与指标",
    items: [
      { id: "access-logs", label: "访问日志", to: "/access-logs", module: "logs", permission: "server", description: "按游标分页的访问日志与日志策略。", apis: ["/api/admin/access-logs*"] },
      { id: "audit-logs", label: "审计日志", to: "/audit-logs", module: "logs", icon: ReceiptText, permission: "log", description: "管理员操作记录。", apis: ["/api/admin/logs*"] },
      { id: "metrics", label: "指标", to: "/metrics", module: "analytics", permission: "server", description: "指标项、图表与前端性能。", apis: ["/api/admin/metrics*", "GET /api/metrics/query"] },
    ],
  },
  {
    id: "business",
    label: "运营",
    items: [
      { id: "finance", label: "财务", to: "/finance", module: "billing", permission: "finance", keywords: ["订单", "退款", "套餐", "优惠券"], description: "订单、退款、账单、套餐、流量包与支付方式。", apis: ["/api/admin/finance/*"] },
      { id: "users", label: "用户", to: "/users", module: "user", permission: "user", description: "用户账号、功能授权与 Access Key。", apis: ["/api/admin/users*"] },
      { id: "admins", label: "管理员", to: "/admins", module: "user", icon: KeyRound, permission: "admin", description: "管理员账号与模块权限。", apis: ["/api/admin/admins*"] },
      { id: "tickets", label: "工单", to: "/tickets", module: "support", icon: Ticket, permission: "ticket", description: "用户工单。", apis: ["/api/admin/tickets*"] },
      { id: "notifications", label: "通知", to: "/notifications", module: "support", icon: Bell, permission: "admin", description: "通知通道、收件人、分组、任务与日志。", apis: ["/api/admin/notifications*"] },
    ],
  },
  {
    id: "system",
    label: "系统",
    items: [
      { id: "settings", label: "系统设置", to: "/settings", module: "system", permission: "setting", description: "门户、注册、认证、运行时与安全设置。", apis: ["/api/admin/settings*"] },
      { id: "maintenance", label: "运维", to: "/maintenance", module: "system", icon: Wrench, permission: "setting", keywords: ["备份", "更新", "健康检查"], description: "健康检查、Doctor、备份、迁移与更新。", apis: ["/api/admin/maintenance/*"] },
      { id: "api-nodes", label: "API 节点", to: "/api-nodes", module: "system", icon: ServerCog, permission: "setting", superOnly: true, description: "控制面 API 节点。", apis: ["/api/admin/api-nodes*"] },
      { id: "database-nodes", label: "数据库节点", to: "/database-nodes", module: "system", icon: Database, permission: "setting", superOnly: true, description: "数据库节点。", apis: ["/api/admin/database-nodes*"] },
    ],
  },
]

export const ADMIN_ROUTES = ADMIN_REGISTRY.flatMap((group) => group.items)
