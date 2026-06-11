import { useUnit } from 'effector-react'
import { Search, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { $doctors, $doctorsLoaded, $doctorsLoading, fetchDoctorsFx } from '@/entities/doctor/model'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

export default function DoctorsPage() {
  const { t } = useTranslation()
  const [doctors, loaded, loading] = useUnit([$doctors, $doctorsLoaded, $doctorsLoading])
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!loaded) void fetchDoctorsFx()
  }, [loaded])

  const q = query.toLowerCase()
  const filtered = doctors.filter(
    (d) => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q),
  )

  return (
    <div>
      <PageHeader title={t('doctors.title')} />
      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t('doctors.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : filtered.map((d) => (
              <Link key={d.id} to={`/parent/doctors/${d.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-gradient-to-br from-sky-400 to-violet-400 font-semibold text-white">{d.name.split(' ').at(-1)?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{d.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{d.specialty}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('doctors.experience', { years: d.experienceYears })} · {d.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="size-4 fill-amber-400 text-amber-400" /> {d.rating}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  )
}
