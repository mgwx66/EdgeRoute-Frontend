import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ReactNode } from "react"
import { LoadingState } from "@edgeroute/ui/components/page-states"
import { Button } from "@edgeroute/ui/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@edgeroute/ui/components/ui/table"
import { formatInteger } from "@edgeroute/ui/lib/format"
import { cn } from "@edgeroute/ui/lib/utils"

export type DataTablePagination =
  | { mode: "page"; page: number; size: number; total: number; onPageChange: (page: number) => void }
  | { mode: "cursor"; hasPrevious: boolean; hasNext: boolean; onPrevious: () => void; onNext: () => void }

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[] | undefined
  getRowId?: (row: TData) => string
  loading?: boolean
  /** Rendered instead of the table when not loading and data is empty. */
  empty?: ReactNode
  /** Rendered instead of the table when set. */
  error?: ReactNode
  pagination?: DataTablePagination
  /** Keeps previous rows dimmed while the next page loads. */
  fetching?: boolean
  caption?: string
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  loading,
  empty,
  error,
  pagination,
  fetching,
  caption,
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data: data ?? [],
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  if (error) return <>{error}</>
  if (loading && !data) return <LoadingState variant="table" />
  if (!loading && data && data.length === 0 && empty) return <>{empty}</>

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className={cn("overflow-hidden rounded-lg border transition-opacity", fetching && "opacity-60")} aria-busy={fetching}>
        <Table>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <TableHeader className="bg-surface-subtle">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 text-xs font-medium text-muted-foreground">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination ? <DataTablePager pagination={pagination} disabled={fetching} /> : null}
    </div>
  )
}

function DataTablePager({ pagination, disabled }: { pagination: DataTablePagination; disabled?: boolean }) {
  if (pagination.mode === "cursor") {
    return (
      <nav aria-label="分页" className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" disabled={disabled || !pagination.hasPrevious} onClick={pagination.onPrevious}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          上一页
        </Button>
        <Button variant="outline" size="sm" disabled={disabled || !pagination.hasNext} onClick={pagination.onNext}>
          下一页
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </nav>
    )
  }
  const { page, size, total, onPageChange } = pagination
  const pageCount = Math.max(1, Math.ceil(total / size))
  return (
    <nav aria-label="分页" className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <span className="tabular-nums">
        共 {formatInteger(total)} 条 · 第 {page} / {pageCount} 页
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">上一页</span>
        </Button>
        <Button variant="outline" size="sm" disabled={disabled || page >= pageCount} onClick={() => onPageChange(page + 1)}>
          <span className="sr-only sm:not-sr-only">下一页</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
