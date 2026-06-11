import { useUnit } from 'effector-react'
import { CalendarClock, MessageCircle, Stethoscope, Syringe } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { $bookings, $bookingsLoaded, fetchBookingsFx } from '@/entities/booking/model'
import { $activeChild } from '@/entities/child/model'
import { $session } from '@/entities/session/model'
import { $vaccines, $vaccinesLoaded, fetchVaccinesFx } from '@/entities/vaccine/model'
import { formatAge } from '@/shared/lib/age'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
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

  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <h1 className="text-xl font-bold sm:text-2xl">{t('home.greeting', { name: session?.name ?? '' })}</h1>

      {child && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Avatar className="size-12">
              <AvatarFallback className="bg-secondary text-lg">{child.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{child.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatAge(child.birthDate)}
                {child.weightKg ? ` · ${child.weightKg} kg` : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <p className="mb-2 font-medium">{t('home.quickActions')}</p>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/parent/chat">
            <Card className="h-full bg-primary text-primary-foreground transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-start gap-2 p-4">
                <MessageCircle className="size-6" />
                <p className="font-semibold">{t('home.startAiCheck')}</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/parent/doctors">
            <Card className="h-full bg-accent text-accent-foreground transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-start gap-2 p-4">
                <Stethoscope className="size-6" />
                <p className="font-semibold">{t('home.bookDoctor')}</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <CalendarClock className="size-5 text-primary" />
          <div>
            <p className="text-sm font-medium">{t('home.nextAppointment')}</p>
            {next ? (
              <p className="text-sm text-muted-foreground">
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
          <CardContent className="flex items-center gap-3 p-4">
            <Syringe className="size-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{t('home.nextVaccine')}</p>
              <p className="text-sm text-muted-foreground">
                {nextVaccine.name} · {new Date(nextVaccine.dueDate).toLocaleDateString(i18n.language)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
