import { useUnit } from 'effector-react'
import { ArrowLeft, CheckCircle2, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { bookingCreated } from '@/entities/booking/model'
import { $activeChild } from '@/entities/child/model'
import { $doctors, $doctorsLoaded, fetchDoctorsFx } from '@/entities/doctor/model'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

const fmtSlot = (iso: string, locale: string) =>
  new Date(iso).toLocaleString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function DoctorProfilePage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const [doctors, loaded, child, book] = useUnit([$doctors, $doctorsLoaded, $activeChild, bookingCreated])
  const [slot, setSlot] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!loaded) void fetchDoctorsFx()
  }, [loaded])

  if (!loaded) return <Skeleton className="h-60 rounded-xl" />
  const doctor = doctors.find((d) => d.id === id)
  if (!doctor) return <PageHeader title="404" />

  const onBook = () => {
    if (!slot) return
    book({
      id: crypto.randomUUID(),
      doctorId: doctor.id,
      doctorName: doctor.name,
      childName: child?.name ?? '—',
      slot,
      status: 'upcoming',
    })
    setConfirmed(true)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-2">
        <Link to="/parent/doctors">
          <ArrowLeft className="size-4" /> {t('common.back')}
        </Link>
      </Button>
      <Card>
        <CardContent className="grid gap-4 p-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-gradient-to-br from-sky-400 to-violet-400 text-xl font-bold text-white">{doctor.name.split(' ').at(-1)?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold">{doctor.name}</h1>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
              <p className="flex items-center gap-1 text-sm">
                <Star className="size-4 fill-amber-400 text-amber-400" /> {doctor.rating} ·{' '}
                {t('doctors.reviews', { count: doctor.reviews })} ·{' '}
                {t('doctors.experience', { years: doctor.experienceYears })}
              </p>
            </div>
            <Badge className="ml-auto" variant="secondary">
              {doctor.price}
            </Badge>
          </div>
          {confirmed ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 p-6 text-emerald-800">
              <CheckCircle2 className="size-8" />
              <p className="font-semibold">{t('doctors.confirmed')}</p>
              <p className="text-sm">
                {slot && fmtSlot(slot, i18n.language)} · {t('doctors.forChild')}: {child?.name ?? '—'}
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="mb-2 font-medium">{t('doctors.chooseSlot')}</p>
                <div className="flex flex-wrap gap-2">
                  {doctor.slots.map((s) => (
                    <Button
                      key={s}
                      variant={slot === s ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setSlot(s)}
                    >
                      {fmtSlot(s, i18n.language)}
                    </Button>
                  ))}
                </div>
              </div>
              {child && (
                <p className="text-sm text-muted-foreground">
                  {t('doctors.forChild')}: {child.name}
                </p>
              )}
              <Button disabled={!slot} onClick={onBook}>
                {t('doctors.book')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
