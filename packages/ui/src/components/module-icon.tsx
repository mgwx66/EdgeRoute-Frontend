import type { LucideIcon } from "lucide-react"
import { cn } from "@edgeroute/ui/lib/utils"
import { MODULES, moduleVars, type ModuleKey } from "@edgeroute/ui/lib/modules"

const SIZES = {
  sm: { tile: "size-6 rounded-md", icon: "size-3.5" },
  md: { tile: "size-8 rounded-lg", icon: "size-4" },
  lg: { tile: "size-10 rounded-xl", icon: "size-5" },
} as const

export interface ModuleIconProps {
  module: ModuleKey
  icon?: LucideIcon
  size?: keyof typeof SIZES
  className?: string
}

export function ModuleIcon({ module, icon, size = "md", className }: ModuleIconProps) {
  const Icon = icon ?? MODULES[module].icon
  const s = SIZES[size]
  return (
    <span
      aria-hidden="true"
      style={moduleVars(module)}
      className={cn("module-tile inline-flex shrink-0 items-center justify-center text-white", s.tile, className)}
    >
      <Icon className={s.icon} strokeWidth={2} />
    </span>
  )
}
