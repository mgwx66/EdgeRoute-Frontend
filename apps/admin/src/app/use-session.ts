import { adminLogout, adminSessionQuery } from "@edgeroute/api/admin"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

export function useAdminSession() {
  return useSuspenseQuery(adminSessionQuery).data
}

export function useAdminLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: adminLogout,
    onSettled: async (_data, error) => {
      if (error) toast.error("退出时出现问题，已清除本地会话")
      queryClient.clear()
      await navigate({ to: "/login" })
    },
  })
}
