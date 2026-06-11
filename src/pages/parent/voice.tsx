import { useUnit } from 'effector-react'
import { Bot, Mic, RotateCcw, ShieldCheck, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { $activeChild } from '@/entities/child/model'
import { buildCase } from '@/entities/case/escalate'
import { caseCreated } from '@/entities/case/model'
import { formatAge } from '@/shared/lib/age'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'

type Phase = 'idle' | 'listening1' | 'thinking1' | 'await' | 'listening2' | 'thinking2' | 'done'

interface Line {
  author: 'parent' | 'ai'
  key: string
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-7 items-end gap-1">
      {[0.4, 0.8, 0.55, 1, 0.7, 0.45, 0.9, 0.6].map((h, i) => (
        <span
          key={i}
          className={cn('w-1.5 rounded-full bg-primary/70', active && 'anim-eq')}
          style={{ height: `${h * 100}%`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  )
}

export default function VoiceCheckPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [child, escalate] = useUnit([$activeChild, caseCreated])
  const [phase, setPhase] = useState<Phase>('idle')
  const [lines, setLines] = useState<Line[]>([])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines.length, phase])

  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms))

  const talk = () => {
    if (phase === 'idle') {
      setPhase('listening1')
      later(2000, () => {
        setLines((l) => [...l, { author: 'parent', key: 'voice.p1' }])
        setPhase('thinking1')
      })
      later(3400, () => {
        setLines((l) => [...l, { author: 'ai', key: 'voice.a1' }])
        setPhase('await')
      })
    } else if (phase === 'await') {
      setPhase('listening2')
      later(2000, () => {
        setLines((l) => [...l, { author: 'parent', key: 'voice.p2' }])
        setPhase('thinking2')
      })
      later(3600, () => {
        setLines((l) => [...l, { author: 'ai', key: 'voice.a2' }])
        setPhase('done')
      })
    }
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    setLines([])
    setPhase('idle')
  }

  const connectToDoctor = () => {
    escalate(
      buildCase({
        childName: child?.name ?? '—',
        childAge: child ? formatAge(child.birthDate) : '—',
        urgency: 'yellow',
        summary: `Voice AI check — ${t('voice.verdict', { lng: 'en' })}`,
        lines: lines.map((line) => ({ author: line.author, text: t(line.key, { lng: 'en' }) })),
      }),
    )
    navigate('/parent/doctors')
  }

  const listening = phase === 'listening1' || phase === 'listening2'
  const thinking = phase === 'thinking1' || phase === 'thinking2'

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={t('nav.voice')}
        action={
          <div className="flex items-center gap-2">
            {child && (
              <Badge variant="secondary">
                {t('chat.checkingFor')}: {child.name}
              </Badge>
            )}
            {phase !== 'idle' && (
              <Button variant="ghost" size="icon" aria-label={t('chat.restart')} onClick={reset}>
                <RotateCcw className="size-4" />
              </Button>
            )}
          </div>
        }
      />
      <p className="-mt-3 mb-5 text-sm text-muted-foreground">{t('voice.subtitle')}</p>

      <Card>
        <CardContent className="grid gap-3">
          {phase === 'idle' && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">{t('voice.hint')}</p>
          )}

          {lines.map((line, i) => (
            <div key={i} className={cn('anim-pop flex max-w-[88%] gap-2.5', line.author === 'ai' ? 'self-start' : 'self-end flex-row-reverse')}>
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full',
                  line.author === 'ai' ? 'bg-primary/10 text-primary' : 'bg-violet-100 text-violet-600',
                )}
              >
                {line.author === 'ai' ? <Bot className="size-4" /> : <User className="size-4" />}
              </span>
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  line.author === 'ai' ? 'rounded-bl-md bg-secondary' : 'rounded-br-md bg-primary text-primary-foreground',
                )}
              >
                {line.author === 'parent' && (
                  <p className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase opacity-70">
                    <Mic className="size-3" /> {t('voice.you')}
                  </p>
                )}
                {t(line.key)}
              </div>
            </div>
          ))}

          {listening && (
            <div className="anim-pop flex items-center gap-3 self-end rounded-2xl rounded-br-md bg-primary/10 px-4 py-2.5">
              <Waveform active />
              <span className="text-sm font-medium text-primary">{t('voice.listening')}</span>
            </div>
          )}
          {thinking && (
            <div className="anim-pop animate-pulse self-start rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
              {t('chat.typing')}
            </div>
          )}

          {phase === 'done' && (
            <div className="anim-pop grid gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-800">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4" /> {t('voice.verdict')}
              </p>
              <Button className="w-fit rounded-full" onClick={connectToDoctor}>
                {t('chat.connectDoctor')}
              </Button>
            </div>
          )}
          <div ref={endRef} />
        </CardContent>
      </Card>

      {(phase === 'idle' || phase === 'await') && (
        <div className="mt-6 grid justify-items-center gap-2">
          <button
            onClick={talk}
            aria-label={t('voice.tap')}
            className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-white shadow-xl shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
          >
            <Mic className="size-8" />
          </button>
          <p className="text-xs text-muted-foreground">{t('voice.tap')}</p>
        </div>
      )}
      {listening && (
        <div className="mt-6 grid justify-items-center gap-2">
          <span className="flex size-20 items-center justify-center rounded-full bg-rose-100">
            <span className="size-4 animate-pulse rounded-full bg-rose-500" />
          </span>
          <p className="text-xs text-muted-foreground">{t('voice.listening')}</p>
        </div>
      )}

      <p className="pt-4 text-center text-xs text-muted-foreground">{t('chat.disclaimer')}</p>
    </div>
  )
}
