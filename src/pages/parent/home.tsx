import { useUnit } from 'effector-react'
import { ArrowRight, CalendarClock, MessageCircle, Ruler, Scale, Stethoscope, Syringe } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { $bookings, $bookingsLoaded, fetchBookingsFx } from '@/entities/booking/model'
import { $activeChild } from '@/entities/child/model'
import { $session } from '@/entities/session/model'
import { $vaccines, $vaccinesLoaded, fetchVaccinesFx } from '@/entities/vaccine/model'
import { formatAge } from '@/shared/lib/age'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'

export default function ParentHomePage() {
  const { t, i18n } = useTranslation()
  const [session, child, bookings, bookingsLoaded, vaccines, vaccinesLoaded] = useUnit([
    $session,
    $activeChild,
    $bookings,
    $bookingsLoaded,
    $vaccines,
    $vaccinesLoaded,
  ])

  useEffect(() => {
    if (!bookingsLoaded) void fetchBookingsFx()
    if (!vaccinesLoaded) void fetchVaccinesFx()
  }, [bookingsLoaded, vaccinesLoaded])

  const next = bookings.filter((b) => b.status === 'upcoming').sort((a, b) => a.slot.localeCompare(b.slot))[0]
  const nextVaccine = vaccines.find((v) => v.status !== 'done')
  const today = new Date().toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <header className="anim-fade-up">
        <p className="text-sm text-muted-foreground capitalize">{today}</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('home.greeting', { name: session?.name ?? '' })}
        </h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Link to="/parent/chat" className="anim-fade-up group" style={{ animationDelay: '100ms' }}>
          <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-violet-500 p-6 text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:-translate-y-0.5">
            <MessageCircle className="mb-3 size-7" />
            <p className="font-heading text-lg font-bold">{t('home.startAiCheck')}</p>
            <ArrowRight className="absolute right-5 bottom-5 size-5 opacity-70 transition-transform group-hover:translate-x-1" />
            <div aria-hidden className="absolute -top-10 -right-10 size-32 rounded-full bg-white/15 blur-2xl" />
          </div>
        </Link>
        <Link to="/parent/doctors" className="anim-fade-up group" style={{ animationDelay: '180ms' }}>
          <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-rose-400 p-6 text-white shadow-lg shadow-violet-500/25 transition-transform group-hover:-translate-y-0.5">
            <Stethoscope className="mb-3 size-7" />
            <p className="font-heading text-lg font-bold">{t('home.bookDoctor')}</p>
            <ArrowRight className="absolute right-5 bottom-5 size-5 opacity-70 transition-transform group-hover:translate-x-1" />
            <div aria-hidden className="absolute -top-10 -right-10 size-32 rounded-full bg-white/15 blur-2xl" />
          </div>
        </Link>
        {child && (
          <Card className="anim-fade-up" style={{ animationDelay: '260ms' }}>
            <CardContent className="flex h-full items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="bg-gradient-to-br from-sky-400 to-violet-400 text-xl font-bold text-white">
                  {child.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-heading text-lg font-bold">{child.name}</p>
                <p className="text-sm text-muted-foreground">{formatAge(child.birthDate)}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {child.weightKg && (
                    <Badge variant="secondary" className="gap-1">
                      <Scale className="size-3" /> {child.weightKg} kg
                    </Badge>
                  )}
                  {child.heightCm && (
                    <Badge variant="secondary" className="gap-1">
                      <Ruler className="size-3" /> {child.heightCm} cm
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="anim-fade-up grid gap-4 sm:grid-cols-2" style={{ animationDelay: '340ms' }}>
        <Card>
          <CardContent className="flex items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <CalendarClock className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t('home.nextAppointment')}</p>
              {next ? (
                <p className="truncate text-sm text-muted-foreground">
                  {next.doctorName} ·{' '}
                  {new Date(next.slot).toLocaleString(i18n.language, {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{t('home.noAppointments')}</p>
              )}
            </div>
          </CardContent>
        </Card>
        {nextVaccine && (
          <Card>
            <CardContent className="flex items-center gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Syringe className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{t('home.nextVaccine')}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {nextVaccine.name} · {new Date(nextVaccine.dueDate).toLocaleDateString(i18n.language)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
