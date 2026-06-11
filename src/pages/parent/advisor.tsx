import { useUnit } from 'effector-react'
import { Check, CircleAlert, Lightbulb, MessageCircle, NotebookPen, RotateCcw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { $activeChild } from '@/entities/child/model'
import { buildCase } from '@/entities/case/escalate'
import { caseCreated } from '@/entities/case/model'
import { assess, type Assessment, type SymptomId } from '@/features/ai-advisor/model/assess'
import { formatAge } from '@/shared/lib/age'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { Textarea } from '@/shared/ui/textarea'

const VERDICT_STYLES = {
  green: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  yellow: 'border-amber-300 bg-amber-50 text-amber-800',
  red: 'border-red-300 bg-red-50 text-red-800',
} as const

const VERDICT_LABEL = {
  green: 'chat.verdictGreen',
  yellow: 'chat.verdictYellow',
  red: 'chat.verdictRed',
} as const

const cap = (s: SymptomId) => s[0].toUpperCase() + s.slice(1)

export default function AdvisorPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [child, escalate] = useUnit([$activeChild, caseCreated])
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'done'>('idle')
  const [result, setResult] = useState<Assessment | null>(null)

  const analyze = () => {
    if (!text.trim()) return
    setPhase('analyzing')
    setTimeout(() => {
      setResult(assess(text))
      setPhase('done')
    }, 1400)
  }

  const reset = () => {
    setText('')
    setResult(null)
    setPhase('idle')
  }

  const connectToDoctor = () => {
    if (!result) return
    const flagged = result.symptoms.map((s) => t(`advisor.s${cap(s)}`, { lng: 'en' })).join(', ')
    escalate(
      buildCase({
        childName: child?.name ?? '—',
        childAge: child ? formatAge(child.birthDate) : '—',
        urgency: result.urgency,
        summary: `AI Advisor — parent described: "${text.slice(0, 160)}". Detected: ${flagged}.`,
        lines: [
          { author: 'parent', text },
          { author: 'ai', text: `Assessment: ${flagged} — urgency ${result.urgency}` },
        ],
      }),
    )
    navigate('/parent/doctors')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={t('nav.advisor')}
        action={
          phase === 'done' && (
            <Button variant="ghost" size="icon" aria-label={t('advisor.again')} onClick={reset}>
              <RotateCcw className="size-4" />
            </Button>
          )
        }
      />
      <p className="-mt-3 mb-5 text-sm text-muted-foreground">{t('advisor.subtitle')}</p>

      {phase !== 'done' && (
        <Card>
          <CardContent className="grid gap-3">
            <Textarea
              rows={4}
              placeholder={t('advisor.placeholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={phase === 'analyzing'}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{t('advisor.examples')}:</span>
              {(['e1', 'e2', 'e3'] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setText(t(`advisor.${e}`))}
                  className="rounded-full border border-border/70 bg-white/60 px-3 py-1 text-xs transition-colors hover:bg-white"
                >
                  {t(`advisor.${e}`)}
                </button>
              ))}
            </div>
            <Button
              className="w-fit rounded-full shadow-lg shadow-primary/20"
              disabled={!text.trim() || phase === 'analyzing'}
              onClick={analyze}
            >
              <Sparkles className={cn('size-4', phase === 'analyzing' && 'animate-pulse')} />
              {phase === 'analyzing' ? t('advisor.analyzing') : t('advisor.analyze')}
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === 'done' && result && (
        <div className="grid gap-4">
          <Card size="sm">
            <CardContent className="flex items-start gap-3">
              <NotebookPen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground italic">“{text}”</p>
            </CardContent>
          </Card>

          {result.symptoms.length === 0 ? (
            <Card className="anim-pop">
              <CardContent className="grid justify-items-center gap-4 py-10 text-center">
                <p className="max-w-sm text-sm text-muted-foreground">{t('advisor.noMatch')}</p>
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/parent/chat">
                    <MessageCircle className="size-4" /> {t('nav.aiChat')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className={cn('anim-pop rounded-2xl border p-4 text-sm font-medium', VERDICT_STYLES[result.urgency])}>
                <p>{t(VERDICT_LABEL[result.urgency])}</p>
                {result.urgency !== 'green' && (
                  <Button className="mt-3 rounded-full" onClick={connectToDoctor}>
                    {t('chat.connectDoctor')}
                  </Button>
                )}
              </div>

              <Card className="anim-pop" style={{ animationDelay: '120ms' }}>
                <CardContent className="grid gap-3">
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                    <Lightbulb className="size-4" /> {t('advisor.likelyTitle')}
                  </p>
                  {result.symptoms.map((s) => (
                    <div key={s} className="flex items-start gap-2.5">
                      <Badge variant="secondary" className="mt-0.5 shrink-0">
                        {t(`advisor.s${cap(s)}`)}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{t(`advisor.l${cap(s)}`)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="anim-pop" style={{ animationDelay: '240ms' }}>
                <CardContent className="grid gap-2.5">
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-emerald-600 uppercase">
                    <Check className="size-4" /> {t('advisor.doTitle')}
                  </p>
                  {[...result.symptoms.flatMap((s) => [`advisor.a${cap(s)}1`, `advisor.a${cap(s)}2`]), 'advisor.aGen'].map(
                    (key) => (
                      <p key={key} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" /> {t(key)}
                      </p>
                    ),
                  )}
                </CardContent>
              </Card>

              <Card className="anim-pop border-l-4 border-l-rose-300" style={{ animationDelay: '360ms' }}>
                <CardContent className="grid gap-2.5">
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-rose-600 uppercase">
                    <CircleAlert className="size-4" /> {t('advisor.watchTitle')}
                  </p>
                  {[...result.symptoms.map((s) => `advisor.w${cap(s)}`), 'advisor.wGen'].map((key) => (
                    <p key={key} className="flex items-start gap-2 text-sm">
                      <CircleAlert className="mt-0.5 size-4 shrink-0 text-rose-400" /> {t(key)}
                    </p>
                  ))}
                </CardContent>
              </Card>

              <Button variant="outline" className="w-fit rounded-full" onClick={reset}>
                <RotateCcw className="size-4" /> {t('advisor.again')}
              </Button>
            </>
          )}
        </div>
      )}

      <p className="pt-4 text-center text-xs text-muted-foreground">{t('chat.disclaimer')}</p>
    </div>
  )
}
