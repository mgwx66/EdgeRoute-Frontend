import { saveUserTheme, userKeys, userLogout, userSessionQuery } from "@edgeroute/api/user"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import type { ThemePreference } from "@edgeroute/ui/components/theme-toggle"

export function useUserSession() {
  return useSuspenseQuery(userSessionQuery).data
}

/** Writes are locked in admin-assisted sessions and when the platform license is read-only. */
export function useWriteLock() {
  const session = useUserSession()
  if (session.sensitiveWritesLocked) return { locked: true as const, reason: "impersonated" as const }
  if (session.licenseReadOnly) return { locked: true as const, reason: "readonly" as const }
  return { locked: false as const, reason: null }
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: userLogout,
    onSettled: async (_data, error) => {
      if (error) toast.error("退出时出现问题，已清除本地会话")
      queryClient.clear()
      await navigate({ to: "/login" })
    },
  })
}

export function useSaveTheme() {
  const queryClient = useQueryClient()
  return (theme: ThemePreference) => {
    saveUserTheme(theme)
      .then(() => queryClient.setQueryData(userKeys.session, (old: ReturnType<typeof useUserSession> | undefined) => (old ? { ...old, theme } : old)))
      .catch(() => toast.error("主题偏好未能同步到账户，仅在本机生效"))
  }
}
