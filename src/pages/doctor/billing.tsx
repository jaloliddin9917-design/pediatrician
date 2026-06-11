import { BadgeCheck, Check, FileDown, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BILLING_VISITS } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { ModuleHeader } from '@/shared/ui/module-header'

export default function BillingPage() {
  const { t } = useTranslation()
  const [visitId, setVisitId] = useState(BILLING_VISITS[0].id)
  const [approved, setApproved] = useState<Set<string>>(new Set())
  const [exported, setExported] = useState(false)

  const visit = BILLING_VISITS.find((v) => v.id === visitId)!
  const keyOf = (code: string) => `${visit.id}:${code}`
  const allApproved = visit.codes.every((c) => approved.has(keyOf(c.code)))

  const toggle = (code: string) => {
    setApproved((prev) => {
      const next = new Set(prev)
      const k = keyOf(code)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
    setExported(false)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <ModuleHeader title={t('nav.billing')} subtitle={t('billing.subtitle')} />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="grid content-start gap-2">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{t('billing.pickVisit')}</p>
          {BILLING_VISITS.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setVisitId(v.id)
                setExported(false)
              }}
              className={cn(
                'rounded-2xl border border-white/70 bg-white/60 p-4 text-left backdrop-blur transition-all hover:bg-white/85',
                v.id === visitId && 'ring-2 ring-primary',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{v.patient}</p>
                <span className="text-xs text-muted-foreground">{v.age}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{v.summary}</p>
            </button>
          ))}
        </div>

        <div className="grid content-start gap-4">
          <Card>
            <CardContent className="grid gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{t('billing.emLevel')}</p>
                <Badge
                  className={cn(
                    'border-transparent',
                    allApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                  )}
                >
                  {allApproved ? t('billing.statusReady') : t('billing.statusDraft')}
                </Badge>
              </div>
              <p className="font-heading text-lg font-bold">{visit.emLevel}</p>
              <p className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-sm text-secondary-foreground">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="font-semibold">{t('billing.reasoning')}: </span>
                  {visit.emReasoning}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-3">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{t('billing.suggested')}</p>
              {visit.codes.map((code) => {
                const isOn = approved.has(keyOf(code.code))
                return (
                  <div
                    key={code.code}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-white/60 p-3"
                  >
                    <span
                      className={cn(
                        'rounded-lg px-2 py-1 font-mono text-xs font-bold',
                        code.kind === 'icd' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700',
                      )}
                    >
                      {code.code}
                    </span>
                    <p className="min-w-0 flex-1 text-sm">{code.label}</p>
                    <div className="flex w-32 items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            code.confidence > 0.85 ? 'bg-emerald-400' : code.confidence > 0.7 ? 'bg-amber-400' : 'bg-rose-400',
                          )}
                          style={{ width: `${code.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.round(code.confidence * 100)}%</span>
                    </div>
                    <Button
                      size="sm"
                      variant={isOn ? 'default' : 'outline'}
                      className="rounded-full"
                      onClick={() => toggle(code.code)}
                    >
                      {isOn ? <BadgeCheck className="size-4" /> : <Check className="size-4" />}
                      {isOn ? t('billing.approved') : t('billing.approve')}
                    </Button>
                  </div>
                )
              })}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
                <p className="text-sm">
                  {t('billing.claimTotal')}: <span className="font-heading text-lg font-bold">{visit.total}</span>
                </p>
                {exported ? (
                  <Badge className="border-transparent bg-emerald-100 text-emerald-700">{t('billing.exported')}</Badge>
                ) : (
                  <Button disabled={!allApproved} className="rounded-full" onClick={() => setExported(true)}>
                    <FileDown className="size-4" /> {t('billing.exportClaim')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
