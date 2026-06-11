import type { ReactNode } from 'react'

export function EmptyState({ icon, text, action }: { icon: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-10 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-muted-foreground">{text}</p>
      {action}
    </div>
  )
}
