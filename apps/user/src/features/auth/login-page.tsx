import { isApiError, safeRedirectPath } from "@edgeroute/api/core"
import { portalQuery, userKeys, userLogin } from "@edgeroute/api/user"
import { AuthLayout } from "@edgeroute/ui/components/auth-layout"
import { Alert, AlertDescription } from "@edgeroute/ui/components/ui/alert"
import { Button } from "@edgeroute/ui/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@edgeroute/ui/components/ui/field"
import { Input } from "@edgeroute/ui/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@edgeroute/ui/components/ui/input-otp"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { AlertCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import { useTheme } from "next-themes"
import { lazy, Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { MOCK_ENABLED } from "@/app/env"

const MockAccountsHint = MOCK_ENABLED ? lazy(() => import("@/app/mock-accounts-hint")) : null

const route = getRouteApi("/login")

const OAUTH_ERRORS: Record<string, string> = {
  denied: "你已取消第三方授权。",
  state: "登录状态校验失败，请重新发起登录。",
  session: "会话已过期，请重新发起登录。",
  token: "第三方授权换取令牌失败，请稍后重试。",
  profile: "未能读取第三方账号信息。",
  identity: "第三方账号身份校验失败。",
  unlinked: "该第三方账号尚未绑定平台账号，请先用密码登录后在账户设置中绑定。",
  configuration: "第三方登录配置异常，请联系管理员。",
  internal: "第三方登录出现内部错误，请稍后重试。",
}

const credentialsSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名").max(200, "用户名过长"),
  password: z.string().min(1, "请输入密码").max(512, "密码过长"),
})

type Credentials = z.infer<typeof credentialsSchema>

export function LoginPage() {
  const search = route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setTheme } = useTheme()
  const portal = useQuery(portalQuery).data
  const [step, setStep] = useState<"credentials" | "mfa">("credentials")
  const [otpCode, setOtpCode] = useState("")
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)

  const form = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { username: "", password: "" },
  })

  const login = useMutation({
    mutationFn: (input: Credentials & { otpCode?: string }) => userLogin(input),
    onSuccess: async (session) => {
      queryClient.setQueryData(userKeys.session, session)
      if (session.theme) setTheme(session.theme)
      await navigate({ href: safeRedirectPath(search.redirect) })
    },
    onError: (error) => {
      if (isApiError(error) && error.code === "mfa_required") {
        if (step === "credentials") {
          setStep("mfa")
          login.reset()
        }
        setOtpCode("")
      }
    },
  })

  const submit = form.handleSubmit((values) => {
    login.mutate(step === "mfa" ? { ...values, otpCode } : values)
  })

  const errorMessage =
    login.error && !(step === "credentials" && isApiError(login.error) && login.error.code === "mfa_required")
      ? login.error.message
      : null
  const oauthError = search["oauth-error"] ? (OAUTH_ERRORS[search["oauth-error"]] ?? "第三方登录失败，请重试。") : null
  const productName = portal?.productName || "EdgeRoute"

  return (
    <AuthLayout
      productName={productName}
      title={step === "mfa" ? "两步验证" : `登录 ${productName}`}
      description={step === "mfa" ? "请输入身份验证器中的 6 位动态码，或使用恢复码。" : portal?.description || "管理你的站点加速、缓存与账单。"}
      footer={portal?.footerText}
      aside={MockAccountsHint ? <Suspense fallback={null}><MockAccountsHint /></Suspense> : null}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {oauthError && step === "credentials" ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{oauthError}</AlertDescription>
          </Alert>
        ) : null}

        {step === "credentials" ? (
          <FieldGroup className="gap-4">
            <Field data-invalid={!!form.formState.errors.username}>
              <FieldLabel htmlFor="username">用户名</FieldLabel>
              <Input
                id="username"
                autoComplete="username"
                autoFocus
                aria-invalid={!!form.formState.errors.username}
                {...form.register("username")}
              />
              <FieldError errors={[form.formState.errors.username]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.password}>
              <FieldLabel htmlFor="password">密码</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!form.formState.errors.password}
                {...form.register("password")}
              />
              <FieldError errors={[form.formState.errors.password]} />
            </Field>
          </FieldGroup>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            {useRecoveryCode ? (
              <Field className="w-full">
                <FieldLabel htmlFor="recovery">恢复码</FieldLabel>
                <Input
                  id="recovery"
                  autoFocus
                  autoComplete="one-time-code"
                  spellCheck={false}
                  className="font-mono"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.trim())}
                />
              </Field>
            ) : (
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus aria-label="动态验证码">
                <InputOTPGroup>
                  {Array.from({ length: 6 }, (_, i) => (
                    <InputOTPSlot key={i} index={i} className="size-11 text-base" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            )}
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              onClick={() => {
                setUseRecoveryCode((v) => !v)
                setOtpCode("")
              }}
            >
              {useRecoveryCode ? "使用动态验证码" : "无法使用身份验证器？使用恢复码"}
            </button>
          </div>
        )}

        {errorMessage ? (
          <Alert variant="destructive" aria-live="assertive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={login.isPending || (step === "mfa" && otpCode.length < 6)}>
            {login.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {step === "mfa" ? "验证并登录" : "登录"}
          </Button>
          {step === "mfa" ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStep("credentials")
                setOtpCode("")
                login.reset()
              }}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              返回
            </Button>
          ) : null}
        </div>
      </form>
    </AuthLayout>
  )
}
