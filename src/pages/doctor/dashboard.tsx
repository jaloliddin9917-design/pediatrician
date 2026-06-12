import { useUnit } from 'effector-react'
import {
  ArrowRight,
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
  const todayKey = today.toISOString().slice(0, 10)
  const upcoming = bookings.filter((b) => b.status === 'upcoming').sort((a, b) => a.slot.localeCompare(b.slot))
  const todayVisits = upcoming.filter((b) => b.slot.startsWith(todayKey))
  const nextVisit = upcoming[0]
  const urgent = cases
    .filter((c) => c.status !== 'closed')
    .sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)

  const stats = [
    { icon: ClipboardList, tint: 'bg-sky-100 text-sky-600', value: cases.filter((c) => c.status === 'new').length, label: t('dash.statNew') },
    { icon: CircleAlert, tint: 'bg-red-100 text-red-600', value: cases.filter((c) => c.urgency === 'red' && c.status !== 'closed').length, label: t('dash.statUrgent') },
    { icon: CalendarClock, tint: 'bg-violet-100 text-violet-600', value: todayVisits.length, label: t('dash.statVisits') },
    { icon: Hourglass, tint: 'bg-amber-100 text-amber-600', value: cases.filter((c) => c.status === 'accepted').length, label: t('dash.statActive') },
  ]

  const join = () => {
    setCall('connecting')
    setTimeout(() => setCall('inCall'), 1500)
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <header className="anim-fade-up">
        <p className="text-sm text-muted-foreground capitalize">
          {today.toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('home.greeting', { name: session?.name ?? '' })}
        </h1>
      </header>

      <div className="anim-fade-up grid grid-cols-2 gap-3 lg:grid-cols-4" style={{ animationDelay: '100ms' }}>
        {stats.map(({ icon: Icon, tint, value, label }) => (
          <Card key={label} size="sm">
            <CardContent className="flex items-center gap-3">
              <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', tint)}>
                <Icon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-2xl font-bold">{value}</p>
                <p className="truncate text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="anim-fade-up grid gap-4 lg:grid-cols-[1.2fr_1fr]" style={{ animationDelay: '200ms' }}>
        <div className="grid content-start gap-4">
          {nextVisit && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-violet-500 p-6 text-primary-foreground shadow-lg shadow-primary/25">
              <div aria-hidden className="absolute -top-10 -right-10 size-36 rounded-full bg-white/15 blur-2xl" />
              <p className="text-xs font-semibold tracking-[0.18em] uppercase opacity-80">{t('dash.nextVisit')}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <Avatar className="size-12 border-2 border-white/40">
                  <AvatarFallback className="bg-white/20 text-lg font-bold text-white">
                    {nextVisit.childName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-xl font-bold">{nextVisit.childName}</p>
                  <p className="text-sm opacity-85">
                    {new Date(nextVisit.slot).toLocaleString(i18n.language, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {t('dash.videoVisit')}
                  </p>
                </div>
                {call === 'idle' && (
                  <Button onClick={join} className="rounded-full bg-white text-primary shadow-md hover:bg-white/90">
                    <Video className="size-4" /> {t('dash.join')}
                  </Button>
                )}
                {call === 'connecting' && (
                  <Badge className="animate-pulse border-transparent bg-white/25 text-white">{t('dash.connecting')}</Badge>
                )}
                {call === 'inCall' && (
                  <span className="flex items-center gap-2">
                    <Badge className="border-transparent bg-emerald-400/90 text-emerald-950">
                      <span className="size-1.5 animate-pulse rounded-full bg-emerald-900" /> {t('dash.inCall')}
                    </Badge>
                    <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/15" onClick={() => setCall('idle')}>
                      <PhoneOff className="size-4" /> {t('dash.endCall')}
                    </Button>
                  </span>
                )}
              </div>
            </div>
          )}

          <Card>
            <CardContent className="grid gap-3">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{t('dash.todayList')}</p>
              {todayVisits.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">{t('doctor.noVisits')}</p>
              ) : (
                todayVisits.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/60 p-3">
                    <Badge variant="secondary" className="font-mono">{b.slot.slice(11, 16)}</Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{b.childName}</p>
                      <p className="truncate text-xs text-muted-foreground">{b.doctorName}</p>
                    </div>
                    <Video className="size-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="content-start">
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{t('dash.urgentQueue')}</p>
              <Button variant="ghost" size="sm" asChild className="rounded-full">
                <Link to="/doctor/queue">
                  {t('dash.openQueue')} <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
            {urgent.length === 0 ? (
              <div className="grid justify-items-center gap-2 py-6 text-center">
                <PartyPopper className="size-6 text-emerald-500" />
                <p className="text-sm text-muted-foreground">{t('dash.allClear')}</p>
              </div>
            ) : (
              urgent.map((c) => (
                <Link
                  key={c.id}
                  to={`/doctor/cases/${c.id}`}
                  className={cn(
                    'grid gap-1.5 rounded-xl border-l-4 bg-white/60 p-3 transition-colors hover:bg-white/90',
                    { red: 'border-l-red-400', yellow: 'border-l-amber-400', green: 'border-l-emerald-400' }[c.urgency],
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{c.childName}</p>
                    <span className="text-xs text-muted-foreground">{c.childAge}</span>
                    <UrgencyBadge urgency={c.urgency} />
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {t('doctorX.waiting')} {formatWaiting(c.createdAt)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{c.aiSummary}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
