import { PlannedPage } from "@edgeroute/ui/components/planned-page"
import type { UserNavItem } from "@/app/nav"

export function PlaceholderPage({ item }: { item: UserNavItem }) {
  return (
    <PlannedPage
      id={item.id}
      module={item.module}
      icon={item.icon}
      title={item.label}
      description={item.description}
      phase="第二期"
      apis={item.apis}
    />
  )
}
