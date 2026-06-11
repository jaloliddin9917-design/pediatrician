import { useUnit } from 'effector-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { $bookings, $bookingsLoaded, $bookingsLoading, fetchBookingsFx } from '@/entities/booking/model'
import type { Booking } from '@/shared/api'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

export default function SchedulePage() {
  const { t, i18n } = useTranslation()
  const [bookings, loaded, loading] = useUnit([$bookings, $bookingsLoaded, $bookingsLoading])

  useEffect(() => {
    if (!loaded) void fetchBookingsFx()
  }, [loaded])

  const upcoming = bookings.filter((b) => b.status === 'upcoming').sort((a, b) => a.slot.localeCompare(b.slot))
  const byDay = upcoming.reduce<Record<string, Booking[]>>((acc, b) => {
    const day = b.slot.slice(0, 10)
    ;(acc[day] ??= []).push(b)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('doctor.scheduleTitle')} />
      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <EmptyState icon="🗓️" text={t('doctor.noVisits')} />
      ) : (
        <div className="grid gap-4">
          {Object.entries(byDay).map(([day, items]) => (
            <div key={day}>
              <p className="mb-2 text-sm font-semibold text-muted-foreground">
                {new Date(day).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div className="grid gap-2">
                {items.map((b) => (
                  <Card key={b.id}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Badge variant="secondary" className="text-base">
                        {b.slot.slice(11, 16)}
                      </Badge>
                      <div>
                        <p className="font-medium">{b.childName}</p>
                        <p className="text-sm text-muted-foreground">{b.doctorName}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
