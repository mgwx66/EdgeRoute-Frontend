import { adminKeys, adminLogin, adminSessionQuery, adminVerifyOtp, type AdminLoginInput } from "@edgeroute/api/admin"
import { safeRedirectPath } from "@edgeroute/api/core"
import { AuthLayout } from "@edgeroute/ui/components/auth-layout"
import { Alert, AlertDescription } from "@edgeroute/ui/components/ui/alert"
import { Button } from "@edgeroute/ui/components/ui/button"
import { Checkbox } from "@edgeroute/ui/components/ui/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel } from "@edgeroute/ui/components/ui/field"
import { Input } from "@edgeroute/ui/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@edgeroute/ui/components/ui/input-otp"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { AlertCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import { lazy, Suspense, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { firstAccessiblePath } from "@/app/access"
import { MOCK_ENABLED } from "@/app/env"

const MockAccountsHint = MOCK_ENABLED ? lazy(() => import("@/app/mock-accounts-hint")) : null

const route = getRouteApi("/login")

const schema = z.object({
  username: z.string().trim().min(1, "请输入用户名"),
  // bcrypt only uses the first 72 bytes; the backend rejects longer passwords.
  password: z
    .string()
    .min(1, "请输入密码")
    .refine((v) => new TextEncoder().encode(v).length <= 72, "密码不能超过 72 字节"),
  remember: z.boolean(),
})

export function LoginPage() {
  const search = route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useQuery(adminSessionQuery).data
  const [challenge, setChallenge] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState("")

  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", remember: false },
  })
  const { errors } = form.formState

  async function finish() {
    await queryClient.invalidateQueries({ queryKey: adminKeys.session })
    const fresh = await queryClient.fetchQuery(adminSessionQuery)
    const fallback = firstAccessiblePath(fresh) ?? "/forbidden"
    await navigate({ to: safeRedirectPath(search.redirect, fallback) })
  }

  const login = useMutation({
    mutationFn: adminLogin,
    onSuccess: async (result) => {
      if (result.requireOTP && result.challenge) {
        setChallenge(result.challenge)
        setOtpCode("")
        return
      }
      await finish()
    },
  })

  const verify = useMutation({
    mutationFn: adminVerifyOtp,
    onSuccess: finish,
  })

  const productName = session?.productName || "EdgeRoute"
  const activeError = challenge ? verify.error : login.error
  const pending = login.isPending || verify.isPending

  return (
    <AuthLayout
      productName={productName}
      badge="管理平台"
      title={challenge ? "动态密码验证" : "管理员登录"}
      description={challenge ? "请输入身份验证器中的动态密码，5 分钟内有效。" : session?.systemName || "EdgeRoute CDN 管理平台"}
      aside={MockAccountsHint ? <Suspense fallback={null}><MockAccountsHint /></Suspense> : null}
    >
      {challenge ? (
        <form
          noValidate
          className="flex flex-col items-center gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            if (otpCode.length >= 6) verify.mutate({ challenge, otpCode, remember: form.getValues("remember") })
          }}
        >
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <InputOTP maxLength={8} value={otpCode} onChange={setOtpCode} autoFocus aria-label="动态密码">
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, i) => (
                <InputOTPSlot key={i} index={i} className="size-11 text-base" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {activeError ? <FormAlert message={activeError.message} /> : null}
          <div className="flex w-full flex-col gap-2">
            <Button type="submit" disabled={pending || otpCode.length < 6}>
              {verify.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              验证并登录
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setChallenge(null)
                verify.reset()
                login.reset()
              }}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              重新登录
            </Button>
          </div>
        </form>
      ) : (
        <form noValidate className="flex flex-col gap-5" onSubmit={form.handleSubmit((values) => login.mutate(values))}>
          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.username}>
              <FieldLabel htmlFor="username">用户名</FieldLabel>
              <Input id="username" autoComplete="username" autoFocus aria-invalid={!!errors.username} {...form.register("username")} />
              <FieldError errors={[errors.username]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">密码</FieldLabel>
              <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...form.register("password")} />
              <FieldError errors={[errors.password]} />
            </Field>
            <Controller
              control={form.control}
              name="remember"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox id="remember" checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                  <FieldLabel htmlFor="remember" className="font-normal">
                    记住登录
                  </FieldLabel>
                </Field>
              )}
            />
          </FieldGroup>
          {activeError ? <FormAlert message={activeError.message} /> : null}
          <Button type="submit" disabled={pending}>
            {login.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            登录
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}

function FormAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive" aria-live="assertive" className="w-full">
      <AlertCircle aria-hidden="true" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
