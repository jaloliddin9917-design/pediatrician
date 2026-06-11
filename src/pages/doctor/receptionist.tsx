import { CalendarCheck, ChevronDown, ChevronUp, PhoneCall, PhoneForwarded, Timer, Voicemail } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RECEPTION_CALLS, type ReceptionCall } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { ModuleHeader } from '@/shared/ui/module-header'

const OUTCOME: Record<ReceptionCall['outcome'], { key: string; cls: string }> = {
  booked: { key: 'reception.booked', cls: 'bg-emerald-100 text-emerald-700' },
  routed: { key: 'reception.routed', cls: 'bg-violet-100 text-violet-700' },
  voicemail: { key: 'reception.voicemail', cls: 'bg-amber-100 text-amber-700' },
  info: { key: 'reception.info', cls: 'bg-sky-100 text-sky-700' },
}

export default function ReceptionistPage() {
  const { t, i18n } = useTranslation()
  const [openId, setOpenId] = useState<string | null>(null)

  const booked = RECEPTION_CALLS.filter((c) => c.outcome === 'booked').length
  const avg = Math.round(RECEPTION_CALLS.reduce((s, c) => s + c.durationSec, 0) / RECEPTION_CALLS.length)
  const deflected = Math.round(
    (RECEPTION_CALLS.filter((c) => c.outcome !== 'routed').length / RECEPTION_CALLS.length) * 100,
  )

  const stats = [
    { icon: PhoneCall, tint: 'bg-violet-100 text-violet-600', value: String(RECEPTION_CALLS.length), label: t('reception.callsToday') },
    { icon: CalendarCheck, tint: 'bg-emerald-100 text-emerald-600', value: String(booked), label: t('reception.bookedToday') },
    { icon: Timer, tint: 'bg-sky-100 text-sky-600', value: `${Math.floor(avg / 60)}:${String(avg % 60).padStart(2, '0')}`, label: t('reception.avgHandle') },
    { icon: PhoneForwarded, tint: 'bg-amber-100 text-amber-600', value: `${deflected}%`, label: t('reception.deflected') },
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <ModuleHeader title={t('nav.receptionist')} subtitle={t('reception.subtitle')} />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ icon: Icon, tint, value, label }) => (
          <Card key={label} size="sm">
            <CardContent className="flex items-center gap-3">
              <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', tint)}>
                <Icon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-xl font-bold">{value}</p>
                <p className="truncate text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3">
        {RECEPTION_CALLS.map((call) => {
          const o = OUTCOME[call.outcome]
          const open = openId === call.id
          return (
            <Card key={call.id}>
              <CardContent className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="flex size-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    {call.outcome === 'voicemail' ? <Voicemail className="size-4.5" /> : <PhoneCall className="size-4.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{call.caller}</p>
                    <p className="text-xs text-muted-foreground">
                      {call.phone} ·{' '}
                      {new Date(call.time).toLocaleString(i18n.language, {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {Math.floor(call.durationSec / 60)}:{String(call.durationSec % 60).padStart(2, '0')}
                    </p>
                  </div>
                  <Badge className={cn('border-transparent', o.cls)}>{t(o.key)}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setOpenId(open ? null : call.id)}
                  >
                    {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    {open ? t('reception.hide') : t('reception.transcript')}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{call.intent}</p>
                {open && (
                  <div className="anim-pop grid gap-1.5 rounded-xl bg-white/70 p-4">
                    {call.transcript.map((line, i) => {
                      const isAi = line.startsWith('AI:')
                      return (
                        <p
                          key={i}
                          className={cn(
                            'max-w-[90%] rounded-xl px-3 py-1.5 text-sm',
                            isAi ? 'self-start bg-secondary' : 'self-end bg-primary/10',
                          )}
                        >
                          {line}
                        </p>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
