import { useUnit } from 'effector-react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { $cases, $casesLoaded, $casesLoading, fetchCasesFx } from '@/entities/case/model'
import { groupPatients } from '@/entities/case/patients'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { CaseStatusBadge } from '@/shared/ui/case-status-badge'
import { EmptyState } from '@/shared/ui/empty-state'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { UrgencyBadge } from '@/shared/ui/urgency-badge'

export default function PatientsPage() {
  const { t, i18n } = useTranslation()
  const [cases, loaded, loading] = useUnit([$cases, $casesLoaded, $casesLoading])
  const [query, setQuery] = useState('')
  const [openName, setOpenName] = useState<string | null>(null)

  useEffect(() => {
    if (!loaded) void fetchCasesFx()
  }, [loaded])

  const patients = groupPatients(cases).filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('nav.patients')} />
      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="rounded-full bg-white/60 pl-9"
          placeholder={t('patients.search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState icon="🧒" text={t('patients.empty')} />
      ) : (
        <div className="grid gap-3">
          {patients.map((p) => {
            const open = openName === p.name
            return (
              <Card key={p.name}>
                <CardContent className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-gradient-to-br from-sky-400 to-violet-400 text-lg font-bold text-white">
                        {p.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{p.name}</p>
                        <span className="text-sm text-muted-foreground">{p.age}</span>
                        <UrgencyBadge urgency={p.worstUrgency} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.visits} {t('patients.visits')} · {t('patients.lastContact')}:{' '}
                        {new Date(p.lastAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setOpenName(open ? null : p.name)}
                    >
                      {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      {t('patients.historyTitle')}
                    </Button>
                  </div>

                  {open && (
                    <div className="anim-pop grid gap-2">
                      {p.cases.map((c) => (
                        <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-white/60 p-3">
                          <span className="text-xs text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                          </span>
                          <UrgencyBadge urgency={c.urgency} />
                          <CaseStatusBadge status={c.status} />
                          <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{c.aiSummary}</p>
                          <Button size="sm" variant="outline" asChild className="rounded-full">
                            <Link to={`/doctor/cases/${c.id}`}>{t('doctor.open')}</Link>
                          </Button>
                        </div>
                      ))}
                      {p.cases[0]?.conclusion && (
                        <p className="rounded-xl bg-secondary/60 p-3 text-sm">
                          <Badge variant="secondary" className="mr-2">{t('history.conclusion')}</Badge>
                          {p.cases[0].conclusion}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
