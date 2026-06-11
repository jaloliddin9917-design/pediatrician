import { useUnit } from 'effector-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { $cases, $casesLoaded, $casesLoading, caseAccepted, fetchCasesFx } from '@/entities/case/model'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { CaseStatusBadge } from '@/shared/ui/case-status-badge'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { UrgencyBadge } from '@/shared/ui/urgency-badge'

const URGENCY_ORDER = { red: 0, yellow: 1, green: 2 } as const

export default function QueuePage() {
  const { t, i18n } = useTranslation()
  const [cases, loaded, loading, accept] = useUnit([$cases, $casesLoaded, $casesLoading, caseAccepted])

  useEffect(() => {
    if (!loaded) void fetchCasesFx()
  }, [loaded])

  const queue = [...cases].sort(
    (a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] || b.createdAt.localeCompare(a.createdAt),
  )

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('doctor.queueTitle')} />
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <EmptyState icon="🎉" text={t('doctor.emptyQueue')} />
      ) : (
        <div className="grid gap-3">
          {queue.map((c) => (
            <Card key={c.id}>
              <CardContent className="grid gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{c.childName}</p>
                  <span className="text-sm text-muted-foreground">{c.childAge}</span>
                  <UrgencyBadge urgency={c.urgency} />
                  <CaseStatusBadge status={c.status} />
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString(i18n.language, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{c.aiSummary}</p>
                <div className="flex gap-2">
                  {c.status === 'new' && (
                    <Button size="sm" onClick={() => accept(c.id)}>
                      {t('doctor.accept')}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/doctor/cases/${c.id}`}>{t('doctor.open')}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
