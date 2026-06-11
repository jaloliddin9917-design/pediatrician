import { CircleAlert, ClipboardCheck, Send, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { INTAKE_FORMS } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { ModuleHeader } from '@/shared/ui/module-header'

export default function NursePage() {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState(INTAKE_FORMS[0].id)
  const [summaryState, setSummaryState] = useState<'idle' | 'generating' | 'ready'>('idle')
  const [sent, setSent] = useState(false)

  const form = INTAKE_FORMS.find((f) => f.id === selectedId)!
  const flags = form.qa.filter((q) => q.flag)

  const pick = (id: string) => {
    setSelectedId(id)
    setSummaryState('idle')
  }

  const generate = () => {
    setSummaryState('generating')
    setTimeout(() => setSummaryState('ready'), 1300)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <ModuleHeader
        title={t('nav.nurse')}
        subtitle={t('nurse.subtitle')}
        action={
          sent ? (
            <Badge className="border-transparent bg-emerald-100 text-emerald-700">{t('nurse.sent')}</Badge>
          ) : (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setSent(true)}>
              <Send className="size-4" /> {t('nurse.sendNew')}
            </Button>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="grid content-start gap-2">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{t('nurse.queue')}</p>
          {INTAKE_FORMS.map((f) => {
            const fFlags = f.qa.filter((q) => q.flag).length
            return (
              <button
                key={f.id}
                onClick={() => pick(f.id)}
                className={cn(
                  'rounded-2xl border border-white/70 bg-white/60 p-4 text-left backdrop-blur transition-all hover:bg-white/85',
                  f.id === selectedId && 'ring-2 ring-primary',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{f.child}</p>
                  <span className="text-xs text-muted-foreground">{f.age}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.visitReason}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge
                    className={cn(
                      'border-transparent',
                      f.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                    )}
                  >
                    {t(f.status === 'completed' ? 'nurse.completed' : 'nurse.pending')}
                  </Badge>
                  {fFlags > 0 && (
                    <Badge className="border-transparent bg-red-100 text-red-700">
                      <CircleAlert className="size-3" /> {fFlags}
                    </Badge>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="grid content-start gap-4">
          {form.status === 'pending' ? (
            <Card>
              <CardContent className="grid justify-items-center gap-3 py-12 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <ClipboardCheck className="size-6" />
                </span>
                <p className="text-sm text-muted-foreground">{t('nurse.pending')}…</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="grid gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                      {form.child} · {form.qa.length} {t('nurse.answers')}
                    </p>
                    {flags.length > 0 ? (
                      <Badge className="border-transparent bg-red-100 text-red-700">
                        <CircleAlert className="size-3" /> {flags.length} {t('nurse.flags')}
                      </Badge>
                    ) : (
                      <Badge className="border-transparent bg-emerald-100 text-emerald-700">{t('nurse.noFlags')}</Badge>
                    )}
                  </div>
                  <div className="grid gap-2">
                    {form.qa.map((qa, i) => (
                      <div
                        key={i}
                        className={cn(
                          'rounded-xl border p-3',
                          qa.flag ? 'border-red-200 bg-red-50/80' : 'border-border/70 bg-white/60',
                        )}
                      >
                        <p className="text-xs text-muted-foreground">{qa.q}</p>
                        <p className={cn('mt-0.5 text-sm font-medium', qa.flag && 'text-red-700')}>
                          {qa.flag && <CircleAlert className="mr-1 inline size-3.5" />}
                          {qa.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardContent className="grid gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                      <Sparkles className="size-4" /> {t('nurse.aiSummary')}
                    </p>
                    {summaryState === 'idle' && (
                      <Button size="sm" className="rounded-full" onClick={generate}>
                        {t('nurse.generate')}
                      </Button>
                    )}
                    {summaryState === 'generating' && (
                      <Badge variant="secondary" className="animate-pulse">{t('nurse.generating')}</Badge>
                    )}
                  </div>
                  {summaryState === 'ready' && <p className="anim-pop text-sm leading-relaxed">{form.summary}</p>}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
