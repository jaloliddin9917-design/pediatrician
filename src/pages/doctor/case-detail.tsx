import { useUnit } from 'effector-react'
import { ArrowLeft, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { $cases, $casesLoaded, caseAccepted, caseClosed, fetchCasesFx } from '@/entities/case/model'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { CaseStatusBadge } from '@/shared/ui/case-status-badge'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { UrgencyBadge } from '@/shared/ui/urgency-badge'

interface MockMsg {
  id: number
  author: 'doctor' | 'parent'
  text: string
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const [cases, loaded, accept, close] = useUnit([$cases, $casesLoaded, caseAccepted, caseClosed])
  const [conclusion, setConclusion] = useState('')
  const [chat, setChat] = useState<MockMsg[]>([])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!loaded) void fetchCasesFx()
  }, [loaded])

  if (!loaded) return <Skeleton className="h-60 rounded-xl" />
  const c = cases.find((x) => x.id === id)
  if (!c) return <PageHeader title="404" />

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setChat((m) => [...m, { id: m.length, author: 'doctor', text }])
    setDraft('')
    setTimeout(() => {
      setChat((m) => [...m, { id: m.length, author: 'parent', text: '👍 Thank you, doctor!' }])
    }, 900)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" size="sm" asChild className="mb-2">
        <Link to="/doctor">
          <ArrowLeft className="size-4" /> {t('common.back')}
        </Link>
      </Button>
      <PageHeader
        title={`${t('doctor.caseTitle')} · ${c.childName}`}
        action={
          <div className="flex gap-2">
            <UrgencyBadge urgency={c.urgency} />
            <CaseStatusBadge status={c.status} />
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid content-start gap-4">
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              <p className="font-medium">{t('doctor.transcript')}</p>
              {c.transcript.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                    m.author === 'ai' ? 'self-start bg-secondary' : 'self-end bg-primary/10',
                  )}
                >
                  {m.text}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              <p className="font-medium">{t('doctor.chatWithParent')}</p>
              {chat.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                    m.author === 'doctor' ? 'self-end bg-primary text-primary-foreground' : 'self-start bg-secondary',
                  )}
                >
                  {m.text}
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  disabled={c.status === 'closed'}
                />
                <Button size="icon" aria-label={t('common.send')} onClick={send} disabled={c.status === 'closed'}>
                  <Send className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid content-start gap-4">
          <Card>
            <CardContent className="grid gap-1 p-4 text-sm">
              <p className="font-medium">{t('doctor.childInfo')}</p>
              <p>{c.childName}</p>
              <p className="text-muted-foreground">
                {t('doctor.age')}: {c.childAge}
              </p>
              <p className="text-muted-foreground">{new Date(c.createdAt).toLocaleString(i18n.language)}</p>
              <p className="mt-1 rounded-lg bg-muted p-2">{c.aiSummary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-2 p-4">
              <p className="font-medium">{t('doctor.writeConclusion')}</p>
              {c.status === 'closed' ? (
                <p className="rounded-lg bg-muted p-2 text-sm">{c.conclusion}</p>
              ) : c.status === 'new' ? (
                <Button onClick={() => accept(c.id)}>{t('doctor.accept')}</Button>
              ) : (
                <>
                  <Textarea
                    rows={4}
                    placeholder={t('doctor.conclusionPlaceholder')}
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                  />
                  <Button
                    disabled={!conclusion.trim()}
                    onClick={() => close({ id: c.id, conclusion: conclusion.trim() })}
                  >
                    {t('doctor.closeCase')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
