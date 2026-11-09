import { USER_DEMO_ACCOUNTS } from "@edgeroute/mocks/user"
import { FlaskConical } from "lucide-react"

export default function MockAccountsHint() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed bg-surface-subtle p-4 text-xs">
      <p className="flex items-center gap-1.5 font-medium text-foreground">
        <FlaskConical className="size-3.5 text-primary" aria-hidden="true" />
        Mock 演示账号
      </p>
      <ul className="flex flex-col gap-1 text-muted-foreground">
        {USER_DEMO_ACCOUNTS.map((a) => (
          <li key={a.username} className="flex flex-wrap items-center gap-x-2">
            <code className="font-mono text-foreground">
              {a.username} / {a.password}
            </code>
            <span>{a.note}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
