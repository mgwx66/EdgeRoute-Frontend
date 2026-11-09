import { describeError, ApiError } from "@edgeroute/api/core"
import { EmptyState, ErrorState, LoadingState, NoAccessState, type NoAccessReason } from "@edgeroute/ui/components/page-states"
import { Button } from "@edgeroute/ui/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@edgeroute/ui/components/ui/tabs"
import { Plus } from "lucide-react"
import { useState } from "react"
import { DesignSection } from "./section"

const NO_ACCESS_REASONS: { value: NoAccessReason; label: string }[] = [
  { value: "permission", label: "模块权限" },
  { value: "plan", label: "套餐功能" },
  { value: "identity", label: "实名认证" },
  { value: "readonly", label: "授权只读" },
]

const SAMPLE_ERROR = describeError(new ApiError({ kind: "unavailable", status: 502, message: "暂时无法连接 API 服务" }))

export function StatesSection() {
  const [reason, setReason] = useState<NoAccessReason>("permission")
  return (
    <DesignSection
      id="states"
      title="四态：加载 / 空 / 错误 / 无权限"
      description="每个数据页面都必须覆盖这四种状态。加载使用与真实布局一致的骨架；空状态带模块图标与主操作；错误给出可读文案与重试；无权限按来源区分引导。"
    >
      <Tabs defaultValue="loading" className="flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="loading">加载</TabsTrigger>
          <TabsTrigger value="empty">空</TabsTrigger>
          <TabsTrigger value="error">错误</TabsTrigger>
          <TabsTrigger value="forbidden">无权限</TabsTrigger>
        </TabsList>
        <TabsContent value="loading" className="flex flex-col gap-4">
          <LoadingState variant="cards" />
          <LoadingState variant="table" rows={4} />
        </TabsContent>
        <TabsContent value="empty">
          <EmptyState
            module="site"
            title="还没有站点"
            description="接入第一个域名后，这里会展示站点列表、同步状态与流量。"
            actions={
              <Button size="sm">
                <Plus className="size-4" aria-hidden="true" />
                接入站点
              </Button>
            }
          />
        </TabsContent>
        <TabsContent value="error">
          <ErrorState title={SAMPLE_ERROR.title} message={SAMPLE_ERROR.message} onRetry={() => undefined} />
        </TabsContent>
        <TabsContent value="forbidden" className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="无权限来源">
            {NO_ACCESS_REASONS.map((r) => (
              <Button
                key={r.value}
                size="sm"
                role="radio"
                aria-checked={reason === r.value}
                variant={reason === r.value ? "secondary" : "ghost"}
                onClick={() => setReason(r.value)}
              >
                {r.label}
              </Button>
            ))}
          </div>
          <NoAccessState
            reason={reason}
            actions={
              reason === "plan" ? <Button size="sm">查看套餐</Button> : reason === "identity" ? <Button size="sm">去实名认证</Button> : null
            }
          />
        </TabsContent>
      </Tabs>
    </DesignSection>
  )
}
