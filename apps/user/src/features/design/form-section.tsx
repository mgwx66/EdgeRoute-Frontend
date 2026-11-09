import { encodeAdminForm, pickDirty } from "@edgeroute/api/admin"
import { Button } from "@edgeroute/ui/components/ui/button"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@edgeroute/ui/components/ui/field"
import { Input } from "@edgeroute/ui/components/ui/input"
import { Switch } from "@edgeroute/ui/components/ui/switch"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { DesignSection } from "./section"

const schema = z.object({
  originHost: z
    .string()
    .trim()
    .min(1, "请输入回源主机")
    .regex(/^[a-z0-9.-]+(:\d{1,5})?$/i, "仅支持域名或 IP，可带端口"),
  readTimeout: z.coerce.number<number>().int("必须是整数").min(1, "最少 1 秒").max(600, "最多 600 秒"),
  http2: z.boolean(),
})

type Values = z.infer<typeof schema>

const CURRENT: Values = { originHost: "origin.example.com", readTimeout: 30, http2: true }

export function FormSection() {
  const [payload, setPayload] = useState<{ json: string; form: string } | null>(null)
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: CURRENT, mode: "onTouched" })
  const { errors, dirtyFields, isDirty } = form.formState

  const onSubmit = form.handleSubmit((values) => {
    const changed = pickDirty(values, dirtyFields)
    setPayload({ json: JSON.stringify(changed, null, 2), form: encodeAdminForm(changed).toString() })
    form.reset(values)
  })

  return (
    <DesignSection
      id="form"
      title="表单与部分更新"
      description="React Hook Form + Zod 校验，错误紧贴字段显示。提交时只发送改动过的字段（dirtyFields），对应后端「不传 = 保持原值」的语义；右侧展示用户端 JSON 与管理端表单两种编码结果。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 rounded-lg border bg-card p-5">
          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.originHost}>
              <FieldLabel htmlFor="originHost">回源主机</FieldLabel>
              <Input id="originHost" aria-invalid={!!errors.originHost} className="font-mono" {...form.register("originHost")} />
              <FieldError errors={[errors.originHost]} />
            </Field>
            <Field data-invalid={!!errors.readTimeout}>
              <FieldLabel htmlFor="readTimeout">读取超时（秒）</FieldLabel>
              <Input id="readTimeout" type="number" inputMode="numeric" aria-invalid={!!errors.readTimeout} {...form.register("readTimeout")} />
              <FieldDescription>范围 1–600 秒。</FieldDescription>
              <FieldError errors={[errors.readTimeout]} />
            </Field>
            <Controller
              control={form.control}
              name="http2"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="http2">回源 HTTP/2</FieldLabel>
                    <FieldDescription>关闭也会被明确提交为 false。</FieldDescription>
                  </FieldContent>
                  <Switch id="http2" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
          </FieldGroup>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={!isDirty}>
              保存更改
            </Button>
            <Button type="button" variant="ghost" disabled={!isDirty} onClick={() => form.reset()}>
              撤销
            </Button>
          </div>
        </form>
        <div className="flex flex-col gap-3 rounded-lg border bg-surface-subtle p-5">
          <p className="text-sm font-medium">最近一次提交的载荷</p>
          {payload ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">用户端 JSON（csrfToken 由请求层追加）</span>
                <pre className="overflow-x-auto rounded-md border bg-background p-3 font-mono text-xs">{payload.json}</pre>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">管理端 x-www-form-urlencoded</span>
                <pre className="overflow-x-auto rounded-md border bg-background p-3 font-mono text-xs">{payload.form || "（无改动）"}</pre>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">修改任意字段后点击「保存更改」。</p>
          )}
        </div>
      </div>
    </DesignSection>
  )
}
