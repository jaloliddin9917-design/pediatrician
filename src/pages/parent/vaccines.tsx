import { useUnit } from 'effector-react'
import { CheckCircle2, CircleAlert, Clock } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { $activeChild } from '@/entities/child/model'
import { $vaccines, $vaccinesLoaded, $vaccinesLoading, fetchVaccinesFx } from '@/entities/vaccine/model'
import type { VaccineDose } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

const STATUS: Record<VaccineDose['status'], { icon: typeof CheckCircle2; cls: string; key: string }> = {
  done: { icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700', key: 'vaccines.done' },
  upcoming: { icon: Clock, cls: 'bg-sky-100 text-sky-700', key: 'vaccines.upcoming' },
  overdue: { icon: CircleAlert, cls: 'bg-red-100 text-red-700', key: 'vaccines.overdue' },
}

export default function VaccinesPage() {
  const { t, i18n } = useTranslation()
  const [vaccines, loaded, loading, child] = useUnit([$vaccines, $vaccinesLoaded, $vaccinesLoading, $activeChild])

  useEffect(() => {
    if (!loaded) void fetchVaccinesFx()
  }, [loaded])

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('vaccines.title')} action={child && <Badge variant="secondary">{child.name}</Badge>} />
      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {vaccines.map((v) => {
            const s = STATUS[v.status]
            const Icon = s.icon
            return (
              <Card key={v.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('vaccines.dueAge')}: {v.dueAge} · {new Date(v.dueDate).toLocaleDateString(i18n.language)}
                    </p>
                  </div>
                  <Badge className={cn('border-transparent', s.cls)}>
                    <Icon className="size-3.5" /> {t(s.key)}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
