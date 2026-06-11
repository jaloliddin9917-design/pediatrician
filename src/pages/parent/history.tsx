import { useUnit } from 'effector-react'
import { Bot, Stethoscope } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { $history, $historyLoaded, $historyLoading, fetchHistoryFx } from '@/entities/consultation/model'
import { Card, CardContent } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { UrgencyBadge } from '@/shared/ui/urgency-badge'

export default function HistoryPage() {
  const { t, i18n } = useTranslation()
  const [history, loaded, loading] = useUnit([$history, $historyLoaded, $historyLoading])

  useEffect(() => {
    if (!loaded) void fetchHistoryFx()
  }, [loaded])

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('history.title')} />
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <EmptyState icon="📋" text={t('history.empty')} />
      ) : (
        <div className="grid gap-3">
          {history.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  {r.kind === 'ai-check' ? <Bot className="size-5" /> : <Stethoscope className="size-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{r.title}</p>
                    {r.urgency && <UrgencyBadge urgency={r.urgency} />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t(r.kind === 'ai-check' ? 'history.aiCheck' : 'history.consultation')} · {r.childName} ·{' '}
                    {new Date(r.date).toLocaleDateString(i18n.language)}
                  </p>
                  {r.conclusion && (
                    <p className="mt-1 rounded-lg bg-muted p-2 text-sm">
                      <span className="font-medium">{t('history.conclusion')}:</span> {r.conclusion}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
