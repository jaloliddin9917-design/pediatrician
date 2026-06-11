import { Check, Mail, MessageSquare, Phone, Printer, Send, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COMM_THREADS, type CommChannel, type CommThread } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { ModuleHeader } from '@/shared/ui/module-header'
import { Textarea } from '@/shared/ui/textarea'

const CHANNEL_ICON: Record<CommChannel, typeof Mail> = {
  fax: Printer,
  email: Mail,
  sms: MessageSquare,
  phone: Phone,
}

const CHANNEL_TINT: Record<CommChannel, string> = {
  fax: 'bg-sky-100 text-sky-600',
  email: 'bg-violet-100 text-violet-600',
  sms: 'bg-emerald-100 text-emerald-600',
  phone: 'bg-amber-100 text-amber-600',
}

export default function CommsPage() {
  const { t, i18n } = useTranslation()
  const [threads, setThreads] = useState<CommThread[]>(COMM_THREADS)
  const [filter, setFilter] = useState<CommChannel | 'all'>('all')
  const [selectedId, setSelectedId] = useState(COMM_THREADS[0].id)
  const [draft, setDraft] = useState('')

  const visible = threads.filter((th) => filter === 'all' || th.channel === filter)
  const selected = threads.find((th) => th.id === selectedId)
  const unreadCount = threads.filter((th) => th.unread).length

  const select = (id: string) => {
    setSelectedId(id)
    setDraft('')
    setThreads((list) => list.map((th) => (th.id === id ? { ...th, unread: false } : th)))
  }

  const send = () => {
    const text = draft.trim()
    if (!text || !selected) return
    setThreads((list) =>
      list.map((th) =>
        th.id === selected.id
          ? { ...th, messages: [...th.messages, { author: 'clinic' as const, text, at: '2026-06-11T10:00' }] }
          : th,
      ),
    )
    setDraft('')
  }

  const markHandled = () => {
    if (!selected) return
    setThreads((list) => list.map((th) => (th.id === selected.id ? { ...th, handled: true } : th)))
  }

  return (
    <div className="mx-auto max-w-6xl">
      <ModuleHeader
        title={t('nav.comms')}
        subtitle={t('comms.subtitle')}
        action={
          unreadCount > 0 && (
            <Badge className="border-transparent bg-rose-100 text-rose-700">
              {unreadCount} {t('comms.unread')}
            </Badge>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'fax', 'email', 'sms', 'phone'] as const).map((ch) => {
          const Icon = ch === 'all' ? Sparkles : CHANNEL_ICON[ch]
          return (
            <button
              key={ch}
              onClick={() => setFilter(ch)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3.5 py-1.5 text-sm font-medium backdrop-blur transition-all hover:bg-white/85',
                filter === ch && 'bg-primary text-primary-foreground hover:bg-primary',
              )}
            >
              <Icon className="size-3.5" /> {ch === 'all' ? t('comms.all') : ch.toUpperCase()}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="grid content-start gap-2">
          {visible.map((th) => {
            const Icon = CHANNEL_ICON[th.channel]
            return (
              <button
                key={th.id}
                onClick={() => select(th.id)}
                className={cn(
                  'rounded-2xl border border-white/70 bg-white/60 p-4 text-left backdrop-blur transition-all hover:bg-white/85',
                  th.id === selectedId && 'ring-2 ring-primary',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', CHANNEL_TINT[th.channel])}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn('truncate text-sm', th.unread ? 'font-bold' : 'font-medium')}>{th.from}</p>
                      {th.unread && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{th.subject}</p>
                  </div>
                  {th.handled && <Check className="size-4 shrink-0 text-emerald-500" />}
                </div>
              </button>
            )
          })}
        </div>

        {selected ? (
          <Card className="content-start">
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
                <div>
                  <p className="font-semibold">{selected.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.from} ·{' '}
                    {new Date(selected.time).toLocaleString(i18n.language, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {selected.handled ? (
                  <Badge className="border-transparent bg-emerald-100 text-emerald-700">
                    <Check className="size-3" /> {t('comms.handled')}
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={markHandled}>
                    {t('comms.markHandled')}
                  </Button>
                )}
              </div>

              <div className="grid gap-2">
                {selected.messages.map((m, i) => (
                  <p
                    key={i}
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                      m.author === 'clinic'
                        ? 'self-end rounded-br-md bg-primary text-primary-foreground'
                        : 'self-start rounded-bl-md bg-secondary',
                    )}
                  >
                    {m.text}
                  </p>
                ))}
              </div>

              <div className="grid gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                  <Sparkles className="size-3.5" /> {t('comms.aiDraft')}
                </p>
                <p className="text-sm text-muted-foreground italic">{selected.aiDraft}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-fit rounded-full"
                  onClick={() => setDraft(selected.aiDraft)}
                >
                  {t('comms.useDraft')}
                </Button>
              </div>

              <div className="grid gap-2">
                <Textarea
                  rows={3}
                  placeholder={t('comms.replyPlaceholder')}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <Button className="w-fit rounded-full" disabled={!draft.trim()} onClick={send}>
                  <Send className="size-4" /> {t('comms.send')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">{t('comms.selectThread')}</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
