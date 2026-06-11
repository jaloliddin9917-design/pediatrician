import { Crown, EyeOff, Play, RotateCcw, Scale, Timer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EVIDENTIA_QUESTIONS } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { ModuleHeader } from '@/shared/ui/module-header'

type Phase = 'pick' | 'running' | 'judging' | 'ranked'

const MEDAL = ['🥇', '🥈', '🥉', '4th']
const ALIAS = ['Model A', 'Model B', 'Model C', 'Model D']

export default function EvidentiaPage() {
  const { t } = useTranslation()
  const [questionId, setQuestionId] = useState(EVIDENTIA_QUESTIONS[0].id)
  const [phase, setPhase] = useState<Phase>('pick')
  const [visible, setVisible] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const question = EVIDENTIA_QUESTIONS.find((q) => q.id === questionId)!

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const run = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPhase('running')
    setVisible(0)
    question.answers.forEach((_, i) => {
      timers.current.push(setTimeout(() => setVisible(i + 1), 600 + i * 700))
    })
    timers.current.push(setTimeout(() => setPhase('judging'), 600 + question.answers.length * 700 + 400))
    timers.current.push(setTimeout(() => setPhase('ranked'), 600 + question.answers.length * 700 + 2200))
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    setPhase('pick')
    setVisible(0)
  }

  const answers =
    phase === 'ranked' ? [...question.answers].sort((a, b) => a.rank - b.rank) : question.answers

  return (
    <div className="mx-auto max-w-5xl">
      <ModuleHeader
        title={t('nav.evidentia')}
        subtitle={t('evidentia.subtitle')}
        action={
          phase === 'ranked' && (
            <Button variant="outline" size="sm" className="rounded-full" onClick={reset}>
              <RotateCcw className="size-4" /> {t('evidentia.rerun')}
            </Button>
          )
        }
      />

      <Card className="mb-5">
        <CardContent className="grid gap-3">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{t('evidentia.pick')}</p>
          <div className="flex flex-wrap gap-2">
            {EVIDENTIA_QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => {
                  setQuestionId(q.id)
                  reset()
                }}
                className={cn(
                  'max-w-md rounded-2xl border border-white/70 bg-white/60 px-4 py-2.5 text-left text-sm backdrop-blur transition-all hover:bg-white/85',
                  q.id === questionId && 'ring-2 ring-primary',
                )}
              >
                {q.question}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {phase === 'pick' && (
              <Button className="rounded-full shadow-lg shadow-primary/25" onClick={run}>
                <Play className="size-4" /> {t('evidentia.battle')}
              </Button>
            )}
            {phase === 'running' && (
              <Badge variant="secondary" className="animate-pulse">{t('evidentia.running')}</Badge>
            )}
            {phase === 'judging' && (
              <Badge className="animate-pulse border-transparent bg-violet-100 text-violet-700">
                <Scale className="size-3.5" /> {t('evidentia.judging')}
              </Badge>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <EyeOff className="size-3.5" /> {t('evidentia.blinded')}
            </span>
          </div>
        </CardContent>
      </Card>

      {phase !== 'pick' && (
        <div className="grid gap-4 md:grid-cols-2">
          {answers.map((a, i) => {
            const shown = phase !== 'running' || i < visible
            if (!shown) return <div key={a.model} className="min-h-40 rounded-2xl border border-dashed border-border/70" />
            const ranked = phase === 'ranked'
            return (
              <Card
                key={a.model}
                className={cn('anim-pop', ranked && a.rank === 1 && 'ring-2 ring-amber-400')}
              >
                <CardContent className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {ranked && <span className="text-xl">{MEDAL[a.rank - 1]}</span>}
                    <p className="font-heading font-bold">
                      {ranked ? a.model : ALIAS[question.answers.indexOf(a)]}
                    </p>
                    {ranked && a.rank === 1 && (
                      <Badge className="border-transparent bg-amber-100 text-amber-700">
                        <Crown className="size-3" /> {t('evidentia.winner')}
                      </Badge>
                    )}
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Timer className="size-3" /> {(a.latencyMs / 1000).toFixed(1)}s {t('evidentia.latency')}
                    </span>
                  </div>
                  {ranked && (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            a.rank === 1 ? 'bg-amber-400' : a.rank === 2 ? 'bg-slate-400' : a.rank === 3 ? 'bg-orange-300' : 'bg-slate-300',
                          )}
                          style={{ width: `${a.score * 10}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{a.score.toFixed(1)}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-muted-foreground">{a.text}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {phase === 'ranked' && (
        <Card className="anim-pop mt-4 border-l-4 border-l-violet-400">
          <CardContent className="grid gap-2">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-violet-600 uppercase">
              <Scale className="size-4" /> {t('evidentia.judgeNote')}
            </p>
            <p className="text-sm leading-relaxed">{question.judgeRationale}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
