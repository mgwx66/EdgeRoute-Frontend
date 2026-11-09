import { adminKeys, adminSessionQuery } from "@edgeroute/api/admin"
import { ADMIN_PROFILES, adminMockStore, rotateAdminCsrf, setAdminProfile, type AdminProfile } from "@edgeroute/mocks/admin"
import { MockDevPanel } from "@edgeroute/mocks/dev-panel"
import { Button } from "@edgeroute/ui/components/ui/button"
import { Label } from "@edgeroute/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@edgeroute/ui/components/ui/select"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import type { AppRouter } from "./router"

export default function AdminMockPanel({ router }: { router: AppRouter }) {
  const queryClient = useQueryClient()
  const [profile, setProfile] = useState<AdminProfile>(() => adminMockStore.get().profile)

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: adminKeys.session })
    await queryClient.fetchQuery(adminSessionQuery)
    await router.invalidate()
  }

  return (
    <MockDevPanel onChange={() => void refresh()}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="mock-profile" className="text-xs">
            当前会话的权限配置
          </Label>
          <Select
            value={profile}
            onValueChange={(value) => {
              const next = value as AdminProfile
              setAdminProfile(next)
              setProfile(next)
              void refresh()
            }}
          >
            <SelectTrigger id="mock-profile" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ADMIN_PROFILES) as AdminProfile[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {ADMIN_PROFILES[key].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            rotateAdminCsrf()
            toast.info("服务端 CSRF 令牌已轮换，下一次 POST 将收到 403 纯文本并自动重试")
          }}
        >
          使 CSRF 令牌失效
        </Button>
      </div>
    </MockDevPanel>
  )
}
