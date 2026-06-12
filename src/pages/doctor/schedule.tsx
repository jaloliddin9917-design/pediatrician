import { useUnit } from 'effector-react'
import { CalendarX2, PhoneOff, Video } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { $bookings, $bookingsLoaded, $bookingsLoading, fetchBookingsFx } from '@/entities/booking/model'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i) // 08:00 – 18:00

const dayKey = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function SchedulePage() {
  const { t, i18n } = useTranslation()
  const [bookings, loaded, loading] = useUnit([$bookings, $bookingsLoaded, $bookingsLoading])
  const [selectedDay, setSelectedDay] = useState(() => dayKey(new Date()))
  const [activeCall, setActiveCall] = useState<{ id: string; phase: 'connecting' | 'inCall' } | null>(null)

  useEffect(() => {
    if (!loaded) void fetchBookingsFx()
  }, [loaded])

  const upcoming = bookings.filter((b) => b.status === 'upcoming')
  const todayKey = dayKey(new Date())

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const key = dayKey(d)
    return { key, date: d, count: upcoming.filter((b) => b.slot.startsWith(key)).length }
  })

  const dayVisits = upcoming.filter((b) => b.slot.startsWith(selectedDay)).sort((a, b) => a.slot.localeCompare(b.slot))
  const byHour = new Map<number, typeof dayVisits>()
  for (const b of dayVisits) {
    const h = Number(b.slot.slice(11, 13))
    byHour.set(h, [...(byHour.get(h) ?? []), b])
  }

  const join = (id: string) => {
    setActiveCall({ id, phase: 'connecting' })
    setTimeout(() => setActiveCall((c) => (c && c.id === id ? { id, phase: 'inCall' } : c)), 1500)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('doctor.scheduleTitle')} />

      {/* 7-day strip */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {days.map(({ key, date, count }) => {
          const selected = key === selectedDay
          return (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              className={cn(
                'relative flex min-w-16 flex-col items-center gap-0.5 rounded-2xl border border-white/70 bg-white/60 px-3 py-2.5 backdrop-blur transition-all hover:bg-white/85',
                selected && 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary',
              )}
            >
              <span className={cn('text-[10px] font-semibold uppercase', selected ? 'opacity-80' : 'text-muted-foreground')}>
                {key === todayKey ? t('doctorX.today') : date.toLocaleDateString(i18n.language, { weekday: 'short' })}
              </span>
              <span className="font-heading text-xl font-bold">{date.getDate()}</span>
              {count > 0 && (
                <span
                  className={cn(
                    'absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full text-[10px] font-bold',
                    selected ? 'bg-white text-primary' : 'bg-primary text-primary-foreground',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : dayVisits.length === 0 ? (
        <Card>
          <CardContent className="grid justify-items-center gap-3 py-14 text-center">
            <CalendarX2 className="size-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">{t('doctorX.emptyDay')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="grid gap-0 p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-3">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {new Date(selectedDay).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <Badge variant="secondary">
                {dayVisits.length} {t('doctorX.visitsShort')}
              </Badge>
            </div>
            {HOURS.map((h) => {
              const slots = byHour.get(h) ?? []
              return (
                <div key={h} className="grid grid-cols-[56px_1fr] border-b border-border/30 last:border-0">
                  <div className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                    {String(h).padStart(2, '0')}:00
                  </div>
                  <div className={cn('border-l border-border/40 px-3 py-2', slots.length === 0 && 'py-3')}>
                    {slots.length === 0 ? (
                      <span className="block h-1" />
                    ) : (
                      slots.map((b) => {
                        const call = activeCall?.id === b.id ? activeCall : null
                        return (
                          <div
                            key={b.id}
                            className="mb-1.5 flex flex-wrap items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 to-violet-100/40 p-3 last:mb-0"
                          >
                            <Badge variant="secondary" className="font-mono">{b.slot.slice(11, 16)}</Badge>
                            <Avatar className="size-9">
                              <AvatarFallback className="bg-gradient-to-br from-sky-400 to-violet-400 text-sm font-bold text-white">
                                {b.childName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{b.childName}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {b.doctorName} · {t('dash.videoVisit')}
                              </p>
                            </div>
                            {!call && (
                              <Button size="sm" className="rounded-full" onClick={() => join(b.id)}>
                                <Video className="size-3.5" /> {t('dash.join')}
                              </Button>
                            )}
                            {call?.phase === 'connecting' && (
                              <Badge variant="secondary" className="animate-pulse">{t('dash.connecting')}</Badge>
                            )}
                            {call?.phase === 'inCall' && (
                              <span className="flex items-center gap-1.5">
                                <Badge className="border-transparent bg-emerald-100 text-emerald-700">
                                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-600" /> {t('dash.inCall')}
                                </Badge>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7 rounded-full text-rose-600"
                                  aria-label={t('dash.endCall')}
                                  onClick={() => setActiveCall(null)}
                                >
                                  <PhoneOff className="size-3.5" />
                                </Button>
                              </span>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
