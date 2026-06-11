import { useUnit } from 'effector-react'
import { RotateCcw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { $activeChild } from '@/entities/child/model'
import {
  $messages,
  $quickReplies,
  $typing,
  $verdict,
  chatRestarted,
  replySelected,
} from '@/features/ai-triage/model/store'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'

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

export default function ChatPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [messages, replies, typing, verdict, child] = useUnit([$messages, $quickReplies, $typing, $verdict, $activeChild])
  const [reply, restart] = useUnit([replySelected, chatRestarted])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, typing, verdict])

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-2xl flex-col md:h-[calc(100vh-7rem)]">
      <PageHeader
        title={t('chat.title')}
        action={
          <div className="flex items-center gap-2">
            {child && (
              <Badge variant="secondary">
                {t('chat.checkingFor')}: {child.name}
              </Badge>
            )}
            <Button variant="ghost" size="icon" aria-label={t('chat.restart')} onClick={() => restart()}>
              <RotateCcw className="size-4" />
            </Button>
          </div>
        }
      />
      <Card className="min-h-0 flex-1">
        <CardContent className="flex h-full flex-col gap-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                m.author === 'ai' ? 'self-start bg-secondary' : 'self-end bg-primary text-primary-foreground',
              )}
            >
              {t(m.key)}
            </div>
          ))}
          {typing && (
            <div className="animate-pulse self-start rounded-2xl bg-secondary px-4 py-2 text-sm text-muted-foreground">
              {t('chat.typing')}
            </div>
          )}
          {verdict && (
            <div className={cn('rounded-2xl border p-4 text-sm font-medium', VERDICT_STYLES[verdict])}>
              <p>{t(VERDICT_LABEL[verdict])}</p>
              {verdict !== 'green' && (
                <Button className="mt-3" onClick={() => navigate('/parent/doctors')}>
                  {t('chat.connectDoctor')}
                </Button>
              )}
            </div>
          )}
          <div ref={endRef} />
        </CardContent>
      </Card>
      {replies.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3">
          {replies.map((key) => (
            <Button key={key} variant="outline" className="rounded-full" onClick={() => reply(key)}>
              {t(key)}
            </Button>
          ))}
        </div>
      )}
      <p className="pt-2 text-center text-xs text-muted-foreground">{t('chat.disclaimer')}</p>
    </div>
  )
}
