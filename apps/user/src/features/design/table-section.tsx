import { DataTable } from "@edgeroute/ui/components/data-table"
import { StatusBadge, type StatusTone } from "@edgeroute/ui/components/status-badge"
import { Button } from "@edgeroute/ui/components/ui/button"
import { formatBytes } from "@edgeroute/ui/lib/format"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useMemo, useState } from "react"
import { DesignSection } from "./section"

interface DemoRow {
  id: string
  domain: string
  status: { tone: StatusTone; label: string }
  traffic: number
  updatedAt: string
}

const STATUSES: DemoRow["status"][] = [
  { tone: "success", label: "已生效" },
  { tone: "info", label: "同步中" },
  { tone: "warning", label: "证书即将到期" },
  { tone: "neutral", label: "已停用" },
]

const ROWS: DemoRow[] = Array.from({ length: 23 }, (_, i) => ({
  id: String(i + 1),
  domain: `${["www", "static", "img", "api", "cdn"][i % 5]}.example${i + 1}.com`,
  status: STATUSES[i % STATUSES.length]!,
  traffic: (i * 7919 + 1) * 1024 * 1024 * 3.3,
  updatedAt: `2026-11-${String((i % 9) + 1).padStart(2, "0")} 1${i % 10}:2${i % 6}`,
}))

const PAGE_SIZE = 5

export function TableSection() {
  const [page, setPage] = useState(1)
  const columns = useMemo<ColumnDef<DemoRow, unknown>[]>(
    () => [
      { accessorKey: "domain", header: "域名", cell: ({ row }) => <span className="font-mono text-[13px]">{row.original.domain}</span> },
      { id: "status", header: "状态", cell: ({ row }) => <StatusBadge tone={row.original.status.tone}>{row.original.status.label}</StatusBadge> },
      { accessorKey: "traffic", header: "本月流量", cell: ({ row }) => <span className="tabular-nums">{formatBytes(row.original.traffic)}</span> },
      { accessorKey: "updatedAt", header: "更新时间", cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{row.original.updatedAt}</span> },
      {
        id: "actions",
        header: () => <span className="sr-only">操作</span>,
        cell: ({ row }) => (
          <Button variant="ghost" size="icon" className="size-8" aria-label={`${row.original.domain} 的更多操作`}>
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </Button>
        ),
      },
    ],
    [],
  )
  const data = ROWS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <DesignSection
      id="table"
      title="数据表格"
      description="基于 TanStack Table，支持页码分页（page/size、offset/size）与游标分页（访问日志）。表格与日志页不使用任何动效与光效；数字列使用等宽数字。以下为界面示例数据。"
    >
      <DataTable
        caption="站点列表示例"
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        pagination={{ mode: "page", page, size: PAGE_SIZE, total: ROWS.length, onPageChange: setPage }}
      />
    </DesignSection>
  )
}
