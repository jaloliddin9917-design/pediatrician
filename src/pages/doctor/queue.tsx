import { useUnit } from 'effector-react'
import { ArrowRight, Check, CircleAlert, ClipboardList, Clock, Hourglass, Search } from 'lucide-react'
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

const RAIL = { red: 'bg-red-400', yellow: 'bg-amber-400', green: 'bg-emerald-400' } as const

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
    { icon: ClipboardList, tint: 'bg-sky-500/10 text-sky-600', bar: 'bg-sky-400', value: cases.filter((c) => c.status === 'new').length, label: t('doctor.statusNew') },
    { icon: CircleAlert, tint: 'bg-red-500/10 text-red-600', bar: 'bg-red-400', value: cases.filter((c) => c.urgency === 'red' && c.status !== 'closed').length, label: t('dash.statUrgent') },
    { icon: Hourglass, tint: 'bg-amber-500/10 text-amber-600', bar: 'bg-amber-400', value: cases.filter((c) => c.status === 'accepted').length, label: t('doctor.statusAccepted') },
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
        {stats.map(({ icon: Icon, tint, bar, value, label }) => (
          <Card key={label} size="sm" className="relative">
            <span className={cn('absolute inset-x-5 top-0 h-1 rounded-b-full', bar)} />
            <CardContent className="grid gap-2 pt-1">
              <div className="flex items-center justify-between">
                <span className={cn('flex size-8 items-center justify-center rounded-lg', tint)}>
                  <Icon className="size-4" />
                </span>
                <span className="font-heading text-2xl font-bold">{value}</span>
              </div>
              <p className="truncate text-[11px] font-medium text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-44 flex-1">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 rounded-full border-white/70 bg-white/70 pl-10"
            placeholder={t('doctorX.searchCases')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex rounded-full border border-white/70 bg-white/60 p-1 backdrop-blur">
          {FILTERS.map(({ id, key }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-all',
                filter === id && 'bg-primary text-primary-foreground shadow-sm',
              )}
            >
              {t(key)}
            </button>
          ))}
        </div>
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
              <Card key={c.id} className="relative transition-shadow hover:shadow-lg hover:shadow-primary/5">
                <span className={cn('absolute inset-y-5 left-2.5 w-1 rounded-full', RAIL[c.urgency])} />
                <CardContent className="grid gap-3 pl-8">
                  <div className="flex flex-wrap items-start gap-3">
                    <Avatar className="size-11">
                      <AvatarFallback className={cn('bg-gradient-to-br text-base font-bold text-white', AVATAR_TINT[c.urgency])}>
                        {c.childName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-base font-semibold">{c.childName}</p>
                        <span className="text-sm text-muted-foreground">{c.childAge}</span>
                        <UrgencyBadge urgency={c.urgency} />
                        <CaseStatusBadge status={c.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleString(i18n.language, {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {c.status !== 'closed' && (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
                        <Clock className="size-3.5" /> {formatWaiting(c.createdAt)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed">{c.aiSummary}</p>

                  {firstParentLine && (
                    <p className="border-l-2 border-primary/30 pl-3 text-sm text-muted-foreground italic">
                      “{firstParentLine}”
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-3">
                    <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground" asChild>
                      <Link to={`/doctor/cases/${c.id}`}>
                        {t('doctor.open')} <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                    {c.status === 'new' && (
                      <Button size="sm" className="rounded-full shadow-md shadow-primary/20" onClick={() => accept(c.id)}>
                        <Check className="size-3.5" /> {t('doctor.accept')}
                      </Button>
                    )}
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
