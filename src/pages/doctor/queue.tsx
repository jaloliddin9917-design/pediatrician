import { useUnit } from 'effector-react'
import { CircleAlert, ClipboardList, Clock, Hourglass, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { $cases, $casesLoaded, $casesLoading, caseAccepted, fetchCasesFx } from '@/entities/case/model'
import type { CaseStatus } from '@/shared/api'
import { formatWaiting } from '@/shared/lib/waiting'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { CaseStatusBadge } from '@/shared/ui/case-status-badge'
import { EmptyState } from '@/shared/ui/empty-state'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { UrgencyBadge } from '@/shared/ui/urgency-badge'

const URGENCY_ORDER = { red: 0, yellow: 1, green: 2 } as const

const URGENCY_RAIL = {
  red: 'border-l-red-400',
  yellow: 'border-l-amber-400',
  green: 'border-l-emerald-400',
} as const

const AVATAR_TINT = {
  red: 'from-rose-400 to-red-400',
  yellow: 'from-amber-400 to-orange-400',
  green: 'from-emerald-400 to-teal-400',
} as const

type Filter = 'all' | CaseStatus

export default function QueuePage() {
  const { t, i18n } = useTranslation()
  const [cases, loaded, loading, accept] = useUnit([$cases, $casesLoaded, $casesLoading, caseAccepted])
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!loaded) void fetchCasesFx()
  }, [loaded])

  const stats = [
    { icon: ClipboardList, tint: 'bg-sky-100 text-sky-600', value: cases.filter((c) => c.status === 'new').length, label: t('doctor.statusNew') },
    { icon: CircleAlert, tint: 'bg-red-100 text-red-600', value: cases.filter((c) => c.urgency === 'red' && c.status !== 'closed').length, label: t('dash.statUrgent') },
    { icon: Hourglass, tint: 'bg-amber-100 text-amber-600', value: cases.filter((c) => c.status === 'accepted').length, label: t('doctor.statusAccepted') },
  ]

  const q = query.toLowerCase()
  const queue = [...cases]
    .filter((c) => filter === 'all' || c.status === filter)
    .filter((c) => c.childName.toLowerCase().includes(q) || c.aiSummary.toLowerCase().includes(q))
    .sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] || b.createdAt.localeCompare(a.createdAt))

  const FILTERS: { id: Filter; key: string }[] = [
    { id: 'all', key: 'doctorX.filterAll' },
    { id: 'new', key: 'doctor.statusNew' },
    { id: 'accepted', key: 'doctor.statusAccepted' },
    { id: 'closed', key: 'doctor.statusClosed' },
  ]

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('doctor.queueTitle')} />

      <div className="mb-4 grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, tint, value, label }) => (
          <Card key={label} size="sm">
            <CardContent className="flex items-center gap-2.5">
              <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', tint)}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-xl font-bold">{value}</p>
                <p className="truncate text-[11px] text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-44 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="rounded-full bg-white/60 pl-9"
            placeholder={t('doctorX.searchCases')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {FILTERS.map(({ id, key }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={cn(
              'rounded-full border border-white/70 bg-white/60 px-3.5 py-1.5 text-sm font-medium backdrop-blur transition-all hover:bg-white/85',
              filter === id && 'bg-primary text-primary-foreground hover:bg-primary',
            )}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <EmptyState icon={cases.length === 0 ? '🎉' : '🔍'} text={t(cases.length === 0 ? 'doctor.emptyQueue' : 'doctorX.emptyFilter')} />
      ) : (
        <div className="grid gap-3">
          {queue.map((c) => {
            const firstParentLine = c.transcript.find((m) => m.author === 'parent')?.text
            return (
              <Card key={c.id} className={cn('border-l-4 transition-shadow hover:shadow-md', URGENCY_RAIL[c.urgency])}>
                <CardContent className="grid gap-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Avatar className="size-10">
                      <AvatarFallback className={cn('bg-gradient-to-br font-bold text-white', AVATAR_TINT[c.urgency])}>
                        {c.childName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{c.childName}</p>
                        <span className="text-sm text-muted-foreground">{c.childAge}</span>
                        <UrgencyBadge urgency={c.urgency} />
                        <CaseStatusBadge status={c.status} />
                      </div>
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleString(i18n.language, {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {c.status !== 'closed' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium">
                            <Clock className="size-3" /> {t('doctorX.waiting')} {formatWaiting(c.createdAt)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm">{c.aiSummary}</p>
                  {firstParentLine && (
                    <p className="rounded-xl bg-secondary/50 px-3 py-2 text-xs text-muted-foreground italic">
                      {t('doctorX.reported')}: “{firstParentLine}”
                    </p>
                  )}

                  <div className="flex gap-2">
                    {c.status === 'new' && (
                      <Button size="sm" className="rounded-full" onClick={() => accept(c.id)}>
                        {t('doctor.accept')}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="rounded-full" asChild>
                      <Link to={`/doctor/cases/${c.id}`}>{t('doctor.open')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
