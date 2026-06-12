import { useUnit } from 'effector-react'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CircleAlert,
  ClipboardList,
  Hourglass,
  PartyPopper,
  PhoneOff,
  Video,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { $bookings, $bookingsLoaded, fetchBookingsFx } from '@/entities/booking/model'
import { $cases, $casesLoaded, fetchCasesFx } from '@/entities/case/model'
import { $session } from '@/entities/session/model'
import { formatWaiting } from '@/shared/lib/waiting'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { UrgencyBadge } from '@/shared/ui/urgency-badge'

const URGENCY_ORDER = { red: 0, yellow: 1, green: 2 } as const

const RAIL = { red: 'bg-red-400', yellow: 'bg-amber-400', green: 'bg-emerald-400' } as const

const dayKey = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const [session, cases, casesLoaded, bookings, bookingsLoaded] = useUnit([
    $session,
    $cases,
    $casesLoaded,
    $bookings,
    $bookingsLoaded,
  ])
  const [call, setCall] = useState<'idle' | 'connecting' | 'inCall'>('idle')

  useEffect(() => {
    if (!casesLoaded) void fetchCasesFx()
    if (!bookingsLoaded) void fetchBookingsFx()
  }, [casesLoaded, bookingsLoaded])

  const today = new Date()
  const todayKey = dayKey(today)
  const upcoming = bookings.filter((b) => b.status === 'upcoming').sort((a, b) => a.slot.localeCompare(b.slot))
  const todayVisits = upcoming.filter((b) => b.slot.startsWith(todayKey))
  const nextVisit = upcoming[0]
  const urgent = cases
    .filter((c) => c.status !== 'closed')
    .sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const key = dayKey(d)
    return {
      key,
      label: d.toLocaleDateString(i18n.language, { weekday: 'short' }),
      count: upcoming.filter((b) => b.slot.startsWith(key)).length,
      isToday: key === todayKey,
    }
  })
  const weekMax = Math.max(1, ...week.map((w) => w.count))
  const weekTotal = week.reduce((s, w) => s + w.count, 0)

  const stats = [
    { icon: ClipboardList, tint: 'bg-sky-500/10 text-sky-600', bar: 'bg-sky-400', value: cases.filter((c) => c.status === 'new').length, label: t('dash.statNew') },
    { icon: CircleAlert, tint: 'bg-red-500/10 text-red-600', bar: 'bg-red-400', value: cases.filter((c) => c.urgency === 'red' && c.status !== 'closed').length, label: t('dash.statUrgent') },
    { icon: CalendarClock, tint: 'bg-violet-500/10 text-violet-600', bar: 'bg-violet-400', value: todayVisits.length, label: t('dash.statVisits') },
    { icon: Hourglass, tint: 'bg-amber-500/10 text-amber-600', bar: 'bg-amber-400', value: cases.filter((c) => c.status === 'accepted').length, label: t('dash.statActive') },
  ]

  const join = () => {
    setCall('connecting')
    setTimeout(() => setCall('inCall'), 1500)
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <header className="anim-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground capitalize">
            {today.toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t('home.greeting', { name: session?.name ?? '' })}
          </h1>
        </div>
        <Button variant="outline" size="sm" asChild className="rounded-full bg-white/60">
          <Link to="/doctor/schedule">
            {t('doctor.scheduleTitle')} <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </header>

      {/* stats */}
      <div className="anim-fade-up grid grid-cols-2 gap-3 lg:grid-cols-4" style={{ animationDelay: '80ms' }}>
        {stats.map(({ icon: Icon, tint, bar, value, label }) => (
          <Card key={label} size="sm" className="relative">
            <span className={cn('absolute inset-x-5 top-0 h-1 rounded-b-full', bar)} />
            <CardContent className="grid gap-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className={cn('flex size-9 items-center justify-center rounded-xl', tint)}>
                  <Icon className="size-4.5" />
                </span>
                <span className="font-heading text-3xl font-bold tracking-tight">{value}</span>
              </div>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="anim-fade-up grid items-start gap-4 lg:grid-cols-[1.25fr_1fr]" style={{ animationDelay: '160ms' }}>
        {/* left column */}
        <div className="grid gap-4">
          {nextVisit && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-500 to-violet-500 p-7 text-primary-foreground shadow-xl shadow-primary/25">
              <div aria-hidden className="absolute -top-14 -right-10 size-44 rounded-full bg-white/15 blur-2xl" />
              <div aria-hidden className="absolute -bottom-16 left-16 size-40 rounded-full bg-violet-300/30 blur-2xl" />
              <div className="relative grid gap-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase opacity-80">{t('dash.nextVisit')}</p>
                  <Badge className="border-transparent bg-white/15 font-mono text-white backdrop-blur">
                    {nextVisit.slot.slice(11, 16)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar className="size-16 border-2 border-white/40 shadow-lg">
                    <AvatarFallback className="bg-white/20 text-2xl font-bold text-white backdrop-blur">
                      {nextVisit.childName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-2xl font-bold">{nextVisit.childName}</p>
                    <p className="text-sm opacity-85">
                      {new Date(nextVisit.slot).toLocaleDateString(i18n.language, {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}{' '}
                      · {t('dash.videoVisit')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {call === 'idle' && (
                    <Button onClick={join} size="lg" className="h-11 rounded-full bg-white px-6 text-primary shadow-md hover:bg-white/90">
                      <Video className="size-4.5" /> {t('dash.join')}
                    </Button>
                  )}
                  {call === 'connecting' && (
                    <Badge className="animate-pulse border-transparent bg-white/20 px-4 py-2 text-sm text-white">
                      {t('dash.connecting')}
                    </Badge>
                  )}
                  {call === 'inCall' && (
                    <>
                      <Badge className="border-transparent bg-emerald-400/90 px-4 py-2 text-sm text-emerald-950">
                        <span className="size-2 animate-pulse rounded-full bg-emerald-900" /> {t('dash.inCall')}
                      </Badge>
                      <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/15" onClick={() => setCall('idle')}>
                        <PhoneOff className="size-4" /> {t('dash.endCall')}
                      </Button>
                    </>
                  )}
                  <span className="ml-auto text-xs opacity-75">
                    {nextVisit.doctorName} · {t('dash.nextInLine')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* this week */}
          <Card>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  {t('dash.thisWeek')}
                </p>
                <Badge variant="secondary">
                  {weekTotal} {t('dash.visitsLabel')}
                </Badge>
              </div>
              <div className="grid h-28 grid-cols-7 items-end gap-2.5">
                {week.map((w) => (
                  <div key={w.key} className="grid h-full content-end justify-items-center gap-1.5">
                    {w.count > 0 && (
                      <span className={cn('text-[11px] font-bold', w.isToday ? 'text-primary' : 'text-muted-foreground')}>
                        {w.count}
                      </span>
                    )}
                    <div
                      className={cn(
                        'w-full max-w-9 rounded-lg transition-all',
                        w.isToday ? 'bg-gradient-to-t from-primary to-violet-400' : w.count > 0 ? 'bg-primary/25' : 'bg-muted',
                      )}
                      style={{ height: `${Math.max(8, (w.count / weekMax) * 72)}px` }}
                    />
                    <span className={cn('text-[10px] font-medium', w.isToday ? 'text-primary' : 'text-muted-foreground')}>
                      {w.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* today's visits */}
          <Card>
            <CardContent className="grid gap-3">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">{t('dash.todayList')}</p>
              {todayVisits.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">{t('doctor.noVisits')}</p>
              ) : (
                todayVisits.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-border/50">
                    <span className="rounded-xl bg-primary/10 px-2.5 py-1.5 font-mono text-sm font-bold text-primary">
                      {b.slot.slice(11, 16)}
                    </span>
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-gradient-to-br from-sky-400 to-violet-400 text-sm font-bold text-white">
                        {b.childName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{b.childName}</p>
                      <p className="truncate text-xs text-muted-foreground">{b.doctorName}</p>
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <Video className="size-3.5" />
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* right column — needs attention */}
        <Card className="lg:sticky lg:top-24">
          <CardContent className="grid gap-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">{t('dash.urgentQueue')}</p>
            <Button variant="ghost" size="sm" asChild className="rounded-full text-primary">
              <Link to="/doctor/queue">
                {t('dash.openQueue')} <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          {urgent.length === 0 ? (
            <div className="grid justify-items-center gap-2 py-8 text-center">
              <PartyPopper className="size-7 text-emerald-500" />
              <p className="text-sm text-muted-foreground">{t('dash.allClear')}</p>
            </div>
          ) : (
            urgent.map((c) => (
              <Link
                key={c.id}
                to={`/doctor/cases/${c.id}`}
                className="group relative grid gap-1.5 overflow-hidden rounded-2xl bg-white/70 p-3.5 pl-5 ring-1 ring-border/50 transition-all hover:bg-white hover:shadow-md"
              >
                <span className={cn('absolute inset-y-3.5 left-2 w-1 rounded-full', RAIL[c.urgency])} />
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{c.childName}</p>
                  <span className="text-xs text-muted-foreground">{c.childAge}</span>
                  <UrgencyBadge urgency={c.urgency} />
                  <ArrowRight className="ml-auto size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{c.aiSummary}</p>
                <p className="text-[10px] font-medium text-muted-foreground/80">
                  {t('doctorX.waiting')} {formatWaiting(c.createdAt)}
                </p>
              </Link>
            ))
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
