import { LazyMotion, MotionConfig } from "motion/react"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { Toaster } from "@edgeroute/ui/components/ui/sonner"
import { TooltipProvider } from "@edgeroute/ui/components/ui/tooltip"

// Animation features load after first paint; components use the lightweight `m` element.
const loadMotionFeatures = () => import("motion/react").then((mod) => mod.domAnimation)

/** Theme + motion + tooltip + toast providers shared by both apps. */
export function AppProviders({ storageKey, children }: { storageKey: string; children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey={storageKey}>
      <LazyMotion features={loadMotionFeatures}>
        <MotionConfig reducedMotion="user">
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </TooltipProvider>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  )
}
