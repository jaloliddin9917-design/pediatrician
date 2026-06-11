import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { CANVAS_DIFFERENTIALS } from '@/shared/api'
import { CASES } from '@/shared/api/fixtures'
import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/ui/card'
import { ModuleHeader } from '@/shared/ui/module-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { UrgencyBadge } from '@/shared/ui/urgency-badge'

export default function CanvasPage() {
  const { t, i18n } = useTranslation()
  const [caseId, setCaseId] = useState(CASES[0].id)

  const c = CASES.find((x) => x.id === caseId)!
  const differentials = CANVAS_DIFFERENTIALS[c.id] ?? []
  const parentLines = c.transcript.filter((m) => m.author === 'parent').map((m) => m.text)

  const soapRows = [
    { section: 'S', label: t('scribe.subjective'), content: parentLines.join(' ') || c.aiSummary },
    { section: 'O', label: t('scribe.objective'), content: `${c.childName}, ${c.childAge}. ${t(`urgency.${c.urgency}`)} triage priority.` },
    { section: 'A', label: t('scribe.assessment'), content: c.aiSummary },
    { section: 'P', label: t('scribe.plan'), content: c.conclusion ?? t('doctor.statusNew') },
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <ModuleHeader title={t('nav.canvas')} subtitle={t('canvas.subtitle')} />

      <div className="mb-4 flex flex-wrap gap-2">
        {CASES.map((x) => (
          <button
            key={x.id}
            onClick={() => setCaseId(x.id)}
            className={cn(
              'flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-1.5 text-sm font-medium backdrop-blur transition-all hover:bg-white/85',
              x.id === caseId && 'ring-2 ring-primary',
            )}
          >
            {x.childName} <span className="text-xs text-muted-foreground">{x.childAge}</span>
          </button>
        ))}
      </div>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">{t('canvas.soapTable')}</TabsTrigger>
          <TabsTrigger value="timeline">{t('canvas.timeline')}</TabsTrigger>
          <TabsTrigger value="differential">{t('canvas.differential')}</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardContent className="grid gap-0 p-0">
              <div className="grid grid-cols-[90px_1fr] border-b border-border/70 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                <span>{t('canvas.section')}</span>
                <span>{t('canvas.content')}</span>
              </div>
              {soapRows.map((row) => (
                <div key={row.section} className="grid grid-cols-[90px_1fr] items-start gap-2 border-b border-border/40 px-6 py-4 last:border-0">
                  <span className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 font-heading text-sm font-bold text-primary">
                      {row.section}
                    </span>
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">{row.label}</p>
                    <p className="mt-0.5 text-sm leading-relaxed">{row.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent>
              <ol className="relative ml-3 grid gap-5 border-l-2 border-primary/15 pl-6">
                <li className="relative">
                  <span className="absolute top-1 -left-[31px] size-3 rounded-full bg-primary ring-4 ring-primary/15" />
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString(i18n.language, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm font-semibold">
                    AI triage <UrgencyBadge urgency={c.urgency} />
                  </p>
                </li>
                {c.transcript.map((m) => (
                  <li key={m.id} className="relative">
                    <span
                      className={cn(
                        'absolute top-1 -left-[29px] size-2.5 rounded-full',
                        m.author === 'ai' ? 'bg-violet-300' : 'bg-sky-300',
                      )}
                    />
                    <p className="text-xs text-muted-foreground">
                      {new Date(m.at).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })} ·{' '}
                      {m.author === 'ai' ? 'AI' : c.childName}
                    </p>
                    <p className="mt-0.5 text-sm">{m.text}</p>
                  </li>
                ))}
                {c.conclusion && (
                  <li className="relative">
                    <span className="absolute top-1 -left-[31px] size-3 rounded-full bg-emerald-400 ring-4 ring-emerald-100" />
                    <p className="text-xs text-muted-foreground">{t('doctor.writeConclusion')}</p>
                    <p className="mt-0.5 text-sm font-medium">{c.conclusion}</p>
                  </li>
                )}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="differential">
          <Card>
            <CardContent className="grid gap-4">
              {differentials.map((d) => (
                <div key={d.dx} className="grid gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{d.dx}</p>
                    <span className="text-xs font-bold text-primary">{Math.round(d.likelihood * 100)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        d.likelihood > 0.4 ? 'bg-rose-400' : d.likelihood > 0.2 ? 'bg-amber-400' : 'bg-emerald-400',
                      )}
                      style={{ width: `${d.likelihood * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-emerald-700">{t('canvas.supports')}:</span> {d.supports} ·{' '}
                    <span className="font-medium text-rose-700">{t('canvas.against')}:</span> {d.against}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
