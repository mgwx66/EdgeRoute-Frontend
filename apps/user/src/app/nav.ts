import type { ShellNavGroup, ShellNavItem } from "@edgeroute/ui/components/app-shell"
import { FolderTree, Palette, UserCog } from "lucide-react"

export interface UserNavItem extends ShellNavItem {
  description: string
  /** Endpoints this page will use; shown on phase-2 placeholders. */
  apis: string[]
  /** Hidden when the portal disables finance (`/api/portal` → `showFinance`). */
  requiresFinance?: boolean
}

export interface UserNavGroup extends ShellNavGroup {
  items: UserNavItem[]
}

export const USER_NAV: UserNavGroup[] = [
  {
    id: "home",
    items: [
      {
        id: "overview",
        label: "概览",
        to: "/",
        module: "overview",
        description: "账户整体运行情况。",
        apis: ["GET /api/dashboard", "GET /api/security-overview", "GET /api/security-posture"],
      },
    ],
  },
  {
    id: "delivery",
    label: "加速",
    items: [
      {
        id: "sites",
        label: "站点",
        to: "/sites",
        module: "site",
        keywords: ["域名", "加速", "源站"],
        description: "接入域名、配置源站、HTTPS、缓存与安全策略。",
        apis: ["GET/POST /api/sites", "POST /api/sites/preflight", "/api/domain-ownership*", "GET/PATCH/DELETE /api/sites/{siteID}"],
      },
      {
        id: "groups",
        label: "站点组",
        to: "/groups",
        module: "site",
        icon: FolderTree,
        description: "按组批量管理站点的共享配置。",
        apis: ["/api/groups*"],
      },
      {
        id: "pages",
        label: "静态网站",
        to: "/pages",
        module: "pages",
        description: "托管静态站点文件并通过边缘节点分发。",
        apis: ["/api/pages*"],
      },
      {
        id: "layer4",
        label: "四层转发",
        to: "/layer4",
        module: "layer4",
        keywords: ["TCP", "UDP"],
        description: "TCP / UDP 端口转发。",
        apis: ["/api/layer4*"],
      },
    ],
  },
  {
    id: "operations",
    label: "运维",
    items: [
      {
        id: "cache",
        label: "缓存刷新预热",
        to: "/cache",
        module: "cache",
        keywords: ["刷新", "预热", "purge"],
        description: "提交 URL / 目录刷新与预热任务，查看任务进度与当日额度。",
        apis: ["GET /api/cache-task-quota", "POST /api/sites/{siteID}/cache/tasks", "GET /api/cache-tasks", "POST /api/cache-tasks/{taskID}/retry"],
      },
      {
        id: "analytics",
        label: "流量统计",
        to: "/analytics",
        module: "analytics",
        keywords: ["带宽", "流量", "请求数"],
        description: "流量、带宽峰值、请求数与攻击数趋势。",
        apis: ["GET /api/statistics", "GET /api/sites/{siteID}/statistics", "GET /api/sites/{siteID}/analysis"],
      },
      {
        id: "logs",
        label: "日志",
        to: "/logs",
        module: "logs",
        keywords: ["访问日志", "审计", "安全事件"],
        description: "请求记录（采样）、安全事件与操作日志。",
        apis: ["GET /api/sites/{siteID}/access-logs", "GET /api/sites/{siteID}/security-events", "GET /api/audit-logs"],
      },
      {
        id: "certificates",
        label: "证书",
        to: "/certificates",
        module: "cert",
        keywords: ["SSL", "HTTPS", "ACME"],
        description: "上传证书、ACME 自动签发与 DNS 服务商授权。",
        apis: ["/api/certificates*", "/api/acme/*", "/api/dns-providers*"],
      },
    ],
  },
  {
    id: "account",
    label: "账户",
    items: [
      {
        id: "billing",
        label: "账单",
        to: "/billing",
        module: "billing",
        keywords: ["套餐", "订单", "充值", "流量包"],
        description: "套餐、流量包、订单、退款与用量账单。",
        apis: ["GET /api/billing", "/api/plans/*", "/api/orders*", "/api/refunds/*", "/api/bills/*"],
        requiresFinance: true,
      },
      {
        id: "support",
        label: "消息与工单",
        to: "/support",
        module: "support",
        description: "站内消息与技术支持工单。",
        apis: ["/api/messages*", "/api/support/*"],
      },
      {
        id: "ai",
        label: "AI 助手",
        to: "/ai",
        module: "ai",
        description: "基于账户数据的智能问答与配置建议。",
        apis: ["/api/ai*"],
      },
      {
        id: "account",
        label: "账户设置",
        to: "/account",
        module: "user",
        icon: UserCog,
        keywords: ["MFA", "密码", "Access Key", "实名"],
        description: "个人资料、登录安全、Access Key 与实名认证。",
        apis: ["/api/profile*", "/api/security*", "/api/access-keys*", "/api/identity*"],
      },
    ],
  },
]

export const DESIGN_NAV_ITEM: UserNavItem = {
  id: "design",
  label: "设计系统",
  to: "/design",
  module: "overview",
  icon: Palette,
  keywords: ["token", "组件"],
  description: "设计 token、组件与交互规范（仅开发环境）。",
  apis: [],
}

export const PLACEHOLDER_ITEMS = USER_NAV.flatMap((g) => g.items).filter((item) => item.to !== "/")

export function visibleUserNav({ showFinance, includeDesign }: { showFinance: boolean; includeDesign: boolean }): UserNavGroup[] {
  const groups = USER_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.requiresFinance || showFinance),
  })).filter((group) => group.items.length > 0)
  if (includeDesign) groups.push({ id: "dev", label: "开发", items: [DESIGN_NAV_ITEM] })
  return groups
}
