import { Check, Copy, Mic, RotateCcw, Square, Stethoscope, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SCRIBE_SCRIPT, SCRIBE_SOAP } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { ModuleHeader } from '@/shared/ui/module-header'

type Phase = 'idle' | 'recording' | 'stopped' | 'generating' | 'ready'

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-end gap-1">
      {[0.4, 0.8, 0.55, 1, 0.7, 0.45, 0.9, 0.6, 0.35, 0.75].map((h, i) => (
        <span
          key={i}
          className={cn('w-1.5 rounded-full bg-primary/70', active && 'anim-eq')}
          style={{ height: `${h * 100}%`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  )
}

function SoapSection({ label, text }: { label: string; text: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copy = () => {
    void navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card className="anim-pop">
      <CardContent className="grid gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{label}</p>
          <Button variant="ghost" size="sm" onClick={copy}>
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            {copied ? t('scribe.copied') : t('scribe.copy')}
          </Button>
        </div>
        <p className="text-sm leading-relaxed">{text}</p>
      </CardContent>
    </Card>
  )
}

export default function ScribePage() {
  const { t } = useTranslation()
  const [phase, setPhase] = useState<Phase>('idle')
  const [lineCount, setLineCount] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current)
    },
    [],
  )

  const start = () => {
    setPhase('recording')
    setLineCount(0)
    timerRef.current = setInterval(() => {
      setLineCount((n) => {
        if (n + 1 >= SCRIBE_SCRIPT.length) {
          if (timerRef.current) clearInterval(timerRef.current)
          setPhase('stopped')
        }
        return Math.min(n + 1, SCRIBE_SCRIPT.length)
      })
    }, 1100)
  }

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('stopped')
  }

  const generate = () => {
    setPhase('generating')
    setTimeout(() => setPhase('ready'), 1400)
  }

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('idle')
    setLineCount(0)
  }

  const lines = SCRIBE_SCRIPT.slice(0, lineCount)

  return (
    <div className="mx-auto max-w-4xl">
      <ModuleHeader
        title={t('nav.scribe')}
        subtitle={t('scribe.subtitle')}
        action={
          phase !== 'idle' && (
            <Button variant="outline" size="sm" className="rounded-full" onClick={reset}>
              <RotateCcw className="size-4" /> {t('scribe.newSession')}
            </Button>
          )
        }
      />

      {phase === 'idle' && (
        <Card>
          <CardContent className="grid justify-items-center gap-5 py-14 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <Mic className="size-9" />
            </span>
            <p className="max-w-md text-sm text-muted-foreground">{t('scribe.idleHint')}</p>
            <Button size="lg" className="rounded-full px-7 shadow-lg shadow-primary/25" onClick={start}>
              <Mic className="size-5" /> {t('scribe.record')}
            </Button>
          </CardContent>
        </Card>
      )}

      {phase !== 'idle' && (
        <div className="grid gap-4">
          <Card>
            <CardContent className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Waveform active={phase === 'recording'} />
                  {phase === 'recording' && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-rose-600">
                      <span className="size-2 animate-pulse rounded-full bg-rose-500" /> {t('scribe.listening')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{t('scribe.patient')}: Otabek · 5y 1m</Badge>
                  {phase === 'recording' && (
                    <Button variant="destructive" size="sm" className="rounded-full" onClick={stop}>
                      <Square className="size-3.5" /> {t('scribe.stop')}
                    </Button>
                  )}
                  {phase === 'stopped' && (
                    <Button size="sm" className="rounded-full" onClick={generate}>
                      {t('scribe.generate')}
                    </Button>
                  )}
                  {phase === 'generating' && (
                    <Button size="sm" className="rounded-full" disabled>
                      {t('scribe.generating')}
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {t('scribe.transcript')}
                </p>
                {lines.map((line, i) => (
                  <div key={i} className="anim-pop flex gap-2.5 text-sm">
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full',
                        line.speaker === 'doctor' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-600',
                      )}
                    >
                      {line.speaker === 'doctor' ? <Stethoscope className="size-3.5" /> : <User className="size-3.5" />}
                    </span>
                    <p className="leading-relaxed">{line.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {phase === 'ready' && (
            <div className="grid gap-3">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{t('scribe.soap')}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <SoapSection label={t('scribe.subjective')} text={SCRIBE_SOAP.s} />
                <SoapSection label={t('scribe.objective')} text={SCRIBE_SOAP.o} />
                <SoapSection label={t('scribe.assessment')} text={SCRIBE_SOAP.a} />
                <SoapSection label={t('scribe.plan')} text={SCRIBE_SOAP.p} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
