import { Check, FileDown, FileText, Mic, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AI_FORMS } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { ModuleHeader } from '@/shared/ui/module-header'

type Phase = 'idle' | 'filling' | 'done'

export default function FormsPage() {
  const { t } = useTranslation()
  const [formId, setFormId] = useState(AI_FORMS[0].id)
  const [phase, setPhase] = useState<Phase>('idle')
  const [filled, setFilled] = useState(0)
  const [downloaded, setDownloaded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const form = AI_FORMS.find((f) => f.id === formId)!

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current)
    },
    [],
  )

  const pick = (id: string) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setFormId(id)
    setPhase('idle')
    setFilled(0)
    setDownloaded(false)
  }

  const fill = () => {
    setPhase('filling')
    setFilled(0)
    setDownloaded(false)
    timerRef.current = setInterval(() => {
      setFilled((n) => {
        if (n + 1 >= form.fields.length) {
          if (timerRef.current) clearInterval(timerRef.current)
          setPhase('done')
        }
        return Math.min(n + 1, form.fields.length)
      })
    }, 650)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <ModuleHeader title={t('nav.forms')} subtitle={t('formsMod.subtitle')} />

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="grid content-start gap-2">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{t('formsMod.library')}</p>
          {AI_FORMS.map((f) => (
            <button
              key={f.id}
              onClick={() => pick(f.id)}
              className={cn(
                'flex items-start gap-3 rounded-2xl border border-white/70 bg-white/60 p-4 text-left backdrop-blur transition-all hover:bg-white/85',
                f.id === formId && 'ring-2 ring-primary',
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <FileText className="size-4.5" />
              </span>
              <span className="min-w-0">
                <p className="text-sm font-semibold">{f.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {f.source} · {f.pages} {t('formsMod.pages')}
                </p>
              </span>
            </button>
          ))}
        </div>

        <Card className="content-start">
          <CardContent className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{t('formsMod.fields')}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {form.fields.length} {t('formsMod.detected')}
                  {phase !== 'idle' && (
                    <>
                      {' '}
                      · {filled}/{form.fields.length} {t('formsMod.complete')}
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={phase === 'filling'}
                  onClick={fill}
                >
                  <Sparkles className="size-4" />
                  {phase === 'filling' ? t('formsMod.filling') : t('formsMod.autofill')}
                </Button>
                <Button size="sm" variant="outline" className="rounded-full" disabled={phase === 'filling'} onClick={fill}>
                  <Mic className="size-4" /> {t('formsMod.voice')}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              {form.fields.map((field, i) => {
                const isFilled = phase !== 'idle' && i < filled
                const isFilling = phase === 'filling' && i === filled
                return (
                  <div
                    key={field.label}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3 transition-all',
                      isFilled ? 'border-emerald-200 bg-emerald-50/70' : 'border-border/70 bg-white/60',
                      isFilling && 'border-primary/40 bg-primary/5',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full text-xs',
                        isFilled ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {isFilled ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">{field.label}</p>
                      {isFilled ? (
                        <p className="anim-pop truncate text-sm font-medium">{field.value}</p>
                      ) : isFilling ? (
                        <span className="mt-1 block h-3 w-2/3 animate-pulse rounded-full bg-primary/15" />
                      ) : (
                        <span className="mt-1 block h-3 w-1/2 rounded-full bg-muted" />
                      )}
                    </div>
                    {isFilled && field.fromContext && (
                      <Badge variant="secondary" className="hidden shrink-0 gap-1 sm:inline-flex">
                        <Sparkles className="size-3" /> AI
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>

            {phase === 'done' && (
              <div className="flex items-center justify-end gap-2 border-t border-border/70 pt-4">
                {downloaded ? (
                  <Badge className="border-transparent bg-emerald-100 text-emerald-700">{t('formsMod.downloaded')}</Badge>
                ) : (
                  <Button className="rounded-full" onClick={() => setDownloaded(true)}>
                    <FileDown className="size-4" /> {t('formsMod.download')}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
