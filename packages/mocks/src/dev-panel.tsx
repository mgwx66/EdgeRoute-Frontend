import { FlaskConical } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Button } from "@edgeroute/ui/components/ui/button"
import { Label } from "@edgeroute/ui/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@edgeroute/ui/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@edgeroute/ui/components/ui/select"
import { Separator } from "@edgeroute/ui/components/ui/separator"
import { getScenario, SCENARIO_LABELS, SCENARIOS, setScenario, type Scenario } from "./scenario"

export interface DevPanelProps {
  /** Called after any mock-state change so the app can refetch the session / re-run route guards. */
  onChange: () => void
  children?: ReactNode
}

/** Floating mock controls. Only mounted when mocks are enabled in development. */
export function MockDevPanel({ onChange, children }: DevPanelProps) {
  const [scenario, setLocalScenario] = useState<Scenario>(getScenario)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="fixed right-4 bottom-4 z-50 gap-1.5 rounded-full bg-background/90 shadow-md backdrop-blur"
          aria-label="打开 Mock 调试面板"
        >
          <FlaskConical className="size-4 text-primary" aria-hidden="true" />
          Mock
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="flex w-80 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">Mock 调试面板</p>
          <p className="text-xs text-muted-foreground">仅开发环境可见，用于验收四态、CSRF 恢复与权限守卫。</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="mock-scenario" className="text-xs">
            业务接口场景
          </Label>
          <Select
            value={scenario}
            onValueChange={(value) => {
              const next = value as Scenario
              setScenario(next)
              setLocalScenario(next)
              onChange()
            }}
          >
            <SelectTrigger id="mock-scenario" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCENARIOS.map((s) => (
                <SelectItem key={s} value={s}>
                  {SCENARIO_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {children ? (
          <>
            <Separator />
            {children}
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
