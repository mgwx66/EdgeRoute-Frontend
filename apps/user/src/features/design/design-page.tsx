import { PageHeader } from "@edgeroute/ui/components/page-header"
import { Palette } from "lucide-react"
import { ChartSection } from "./chart-section"
import { ConfirmSection } from "./confirm-section"
import { FormSection } from "./form-section"
import { MotionSection } from "./motion-section"
import { StatesSection } from "./states-section"
import { TableSection } from "./table-section"
import { TokensSection } from "./tokens-section"

export function DesignPage() {
  return (
    <>
      <PageHeader
        module="overview"
        icon={Palette}
        title="设计系统"
        description="EdgeRoute 的 token、模块配色、四态、危险操作分级与基础组件。亮暗主题共用同一套 token。"
      />
      <TokensSection />
      <StatesSection />
      <TableSection />
      <ConfirmSection />
      <FormSection />
      <ChartSection />
      <MotionSection />
    </>
  )
}
