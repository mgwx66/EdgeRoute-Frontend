import { ConfirmDialog } from "@edgeroute/ui/components/confirm-dialog"
import { Button } from "@edgeroute/ui/components/ui/button"
import type { ReactNode } from "react"
import { toast } from "sonner"
import { DesignSection } from "./section"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function ConfirmSection() {
  return (
    <DesignSection
      id="confirm"
      title="危险操作分级确认"
      description="L1 二次确认；L2 输入资源名；L3 输入后端要求的确认串（如 UPDATE <版本>、planId）；L4 重新验证身份，并提示写入审计日志。确认按钮在提交期间禁用，失败时弹窗保持打开并显示错误。"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LevelCard level="L1" title="二次确认" example="停用站点、重试任务">
          <ConfirmDialog
            level={1}
            title="停用站点 www.example.com？"
            description="停用后边缘节点将不再为该域名提供加速，可随时重新启用。"
            confirmLabel="停用"
            onConfirm={async () => {
              await wait(600)
              toast.success("站点已停用")
            }}
            trigger={<Button variant="outline">L1 停用站点</Button>}
          />
        </LevelCard>
        <LevelCard level="L2" title="输入资源名" example="删除站点、证书、节点、用户">
          <ConfirmDialog
            level={2}
            expected="www.example.com"
            title="删除站点"
            description="此操作不可撤销，站点的全部配置与统计数据将被删除。"
            confirmLabel="永久删除"
            onConfirm={async () => {
              await wait(600)
              toast.success("站点已删除")
            }}
            trigger={<Button variant="outline">L2 删除站点</Button>}
          />
        </LevelCard>
        <LevelCard level="L3" title="输入确认串" example="应用更新、迁移开始与回滚">
          <ConfirmDialog
            level={3}
            expected="UPDATE 1.4.2"
            title="应用系统更新 1.4.2"
            description="更新期间管理端将短暂不可用，请在业务低峰期执行。"
            confirmLabel="开始更新"
            onConfirm={async () => {
              await wait(600)
              throw new Error("模拟失败：更新包签名校验未通过")
            }}
            trigger={<Button variant="outline">L3 应用更新（模拟失败）</Button>}
          />
        </LevelCard>
        <LevelCard level="L4" title="重新验证身份" example="创建 Access Key、导出私钥">
          <ConfirmDialog
            level={4}
            requireOtp
            audited
            tone="default"
            title="创建 Access Key"
            description="新密钥只会显示一次，请妥善保存。"
            confirmLabel="验证并创建"
            onConfirm={async () => {
              await wait(600)
              toast.success("Access Key 已创建")
            }}
            trigger={<Button variant="outline">L4 创建密钥</Button>}
          />
        </LevelCard>
      </div>
    </DesignSection>
  )
}

function LevelCard({ level, title, example, children }: { level: string; title: string; example: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-destructive-soft px-1.5 py-0.5 font-mono text-xs font-semibold text-destructive-soft-foreground">{level}</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground">{example}</p>
      <div className="mt-auto">{children}</div>
    </div>
  )
}
