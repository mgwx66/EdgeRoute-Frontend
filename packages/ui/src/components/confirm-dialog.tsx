import { Loader2, ShieldAlert } from "lucide-react"
import { useId, useState, type ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@edgeroute/ui/components/ui/alert-dialog"
import { Button } from "@edgeroute/ui/components/ui/button"
import { Input } from "@edgeroute/ui/components/ui/input"
import { Label } from "@edgeroute/ui/components/ui/label"

/**
 * L1 二次确认 · L2 输入资源名 · L3 输入后端要求的确认串 · L4 重新验证身份
 */
export type ConfirmLevel = 1 | 2 | 3 | 4

export interface ConfirmInput {
  password?: string
  otpCode?: string
}

export interface ConfirmDialogProps {
  level: ConfirmLevel
  trigger: ReactNode
  title: string
  description?: ReactNode
  confirmLabel?: string
  tone?: "danger" | "default"
  /** L2: resource name; L3: exact confirmation string required by the backend. */
  expected?: string
  /** L4: also ask for an OTP code. */
  requireOtp?: boolean
  /** Show the "will be written to audit log" notice. */
  audited?: boolean
  onConfirm: (input: ConfirmInput) => unknown
}

export function ConfirmDialog({
  level,
  trigger,
  title,
  description,
  confirmLabel = "确认",
  tone = "danger",
  expected,
  requireOtp,
  audited,
  onConfirm,
}: ConfirmDialogProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const [password, setPassword] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const needsTyping = (level === 2 || level === 3) && expected !== undefined
  const typedOk = !needsTyping || typed === expected
  const reauthOk = level !== 4 || (password.length > 0 && (!requireOtp || otpCode.length >= 6))
  const canConfirm = typedOk && reauthOk && !pending

  function reset() {
    setTyped("")
    setPassword("")
    setOtpCode("")
    setError(null)
    setPending(false)
  }

  async function handleConfirm() {
    if (!canConfirm) return
    setPending(true)
    setError(null)
    try {
      await onConfirm(level === 4 ? { password, otpCode: requireOtp ? otpCode : undefined } : {})
      setOpen(false)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败，请重试")
      setPending(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return
        setOpen(next)
        if (!next) reset()
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void handleConfirm()
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
          </AlertDialogHeader>

          {needsTyping ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-typed`} className="font-normal leading-relaxed text-muted-foreground">
                <span>
                  请输入 <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{expected}</code> 以确认
                </span>
              </Label>
              <Input
                id={`${id}-typed`}
                value={typed}
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
                onChange={(e) => setTyped(e.target.value)}
              />
            </div>
          ) : null}

          {level === 4 ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-password`}>当前密码</Label>
                <Input
                  id={`${id}-password`}
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {requireOtp ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`${id}-otp`}>动态验证码</Label>
                  <Input
                    id={`${id}-otp`}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    value={otpCode}
                    className="font-mono tracking-widest"
                    onChange={(e) => setOtpCode(e.target.value.replace(/\s/g, ""))}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {audited ? (
            <p className="flex items-center gap-2 rounded-md bg-warning-soft px-3 py-2 text-xs text-warning-soft-foreground">
              <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
              该操作会写入审计日志。
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={pending}>
              取消
            </AlertDialogCancel>
            <Button type="submit" variant={tone === "danger" ? "destructive" : "default"} disabled={!canConfirm}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
