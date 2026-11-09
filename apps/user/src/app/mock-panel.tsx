import { rotateUserCsrf, userMockStore } from "@edgeroute/mocks/user"
import { MockDevPanel } from "@edgeroute/mocks/dev-panel"
import { Button } from "@edgeroute/ui/components/ui/button"
import { Label } from "@edgeroute/ui/components/ui/label"
import { Switch } from "@edgeroute/ui/components/ui/switch"
import { userKeys } from "@edgeroute/api/user"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import type { AppRouter } from "./router"

export default function UserMockPanel({ router }: { router: AppRouter }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState(userMockStore.get)

  const refresh = async () => {
    setState(userMockStore.get())
    await queryClient.invalidateQueries()
    await router.invalidate()
  }

  return (
    <MockDevPanel onChange={() => void refresh()}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="mock-impersonated" className="text-xs font-normal">
            管理员协助会话
          </Label>
          <Switch
            id="mock-impersonated"
            checked={state.impersonated}
            onCheckedChange={(checked) => {
              userMockStore.patch({ impersonated: checked })
              void refresh()
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="mock-readonly" className="text-xs font-normal">
            授权失效只读
          </Label>
          <Switch
            id="mock-readonly"
            checked={state.licenseReadOnly}
            onCheckedChange={(checked) => {
              userMockStore.patch({ licenseReadOnly: checked })
              void refresh()
            }}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            rotateUserCsrf()
            toast.info("服务端 CSRF 令牌已轮换，下一次写操作将自动刷新令牌并重试")
          }}
        >
          使 CSRF 令牌失效
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            userMockStore.patch({ authenticated: false })
            toast.info("服务端会话已过期，正在重新请求资料以触发 401")
            void queryClient.invalidateQueries({ queryKey: userKeys.profile })
          }}
        >
          使会话过期（401）
        </Button>
      </div>
    </MockDevPanel>
  )
}
