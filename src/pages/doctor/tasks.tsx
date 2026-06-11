import { useUnit } from 'effector-react'
import { CalendarDays, CircleCheck, CirclePlay, Plus, RotateCcw } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { $tasks, taskCreated, taskMoved } from '@/entities/task/model'
import type { ClinicTask, TaskStatus } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ModuleHeader } from '@/shared/ui/module-header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const PRIORITY_CLS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-sky-100 text-sky-700',
} as const

const COLUMNS: { status: TaskStatus; key: string; dot: string }[] = [
  { status: 'todo', key: 'tasksMod.todo', dot: 'bg-sky-400' },
  { status: 'inProgress', key: 'tasksMod.inProgress', dot: 'bg-amber-400' },
  { status: 'done', key: 'tasksMod.done', dot: 'bg-emerald-400' },
]

function NewTaskDialog() {
  const { t } = useTranslation()
  const create = useUnit(taskCreated)
  const [open, setOpen] = useState(false)
  const [priority, setPriority] = useState<ClinicTask['priority']>('medium')

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    create({
      id: crypto.randomUUID(),
      title: String(f.get('title')),
      assignee: String(f.get('assignee')),
      priority,
      due: String(f.get('due')),
      status: 'todo',
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full shadow-lg shadow-primary/20">
          <Plus className="size-4" /> {t('tasksMod.new')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('tasksMod.new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="title">{t('tasksMod.title')}</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="assignee">{t('tasksMod.assignee')}</Label>
            <Input id="assignee" name="assignee" required defaultValue="Nurse Zarina" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>{t('tasksMod.priority')}</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as ClinicTask['priority'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t('tasksMod.high')}</SelectItem>
                  <SelectItem value="medium">{t('tasksMod.medium')}</SelectItem>
                  <SelectItem value="low">{t('tasksMod.low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="due">{t('tasksMod.due')}</Label>
              <Input id="due" name="due" type="date" required defaultValue="2026-06-12" />
            </div>
          </div>
          <Button type="submit">{t('tasksMod.create')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TaskCard({ task }: { task: ClinicTask }) {
  const { t, i18n } = useTranslation()
  const move = useUnit(taskMoved)

  return (
    <Card size="sm" className="anim-pop">
      <CardContent className="grid gap-2.5">
        <p className={cn('text-sm font-semibold', task.status === 'done' && 'text-muted-foreground line-through')}>
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={cn('border-transparent', PRIORITY_CLS[task.priority])}>{t(`tasksMod.${task.priority}`)}</Badge>
          <Badge variant="outline" className="gap-1">
            <CalendarDays className="size-3" />
            {new Date(task.due).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-violet-400 text-[10px] font-bold text-white">
              {task.assignee[0]}
            </span>
            {task.assignee}
          </span>
          {task.status === 'todo' && (
            <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => move({ id: task.id, action: 'start' })}>
              <CirclePlay className="size-3.5" /> {t('tasksMod.start')}
            </Button>
          )}
          {task.status === 'inProgress' && (
            <Button size="sm" variant="ghost" className="h-7 rounded-full text-emerald-700" onClick={() => move({ id: task.id, action: 'complete' })}>
              <CircleCheck className="size-3.5" /> {t('tasksMod.complete')}
            </Button>
          )}
          {task.status === 'done' && (
            <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => move({ id: task.id, action: 'reopen' })}>
              <RotateCcw className="size-3.5" /> {t('tasksMod.reopen')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function TasksPage() {
  const { t } = useTranslation()
  const tasks = useUnit($tasks)

  return (
    <div className="mx-auto max-w-6xl">
      <ModuleHeader title={t('nav.tasks')} subtitle={t('tasksMod.subtitle')} action={<NewTaskDialog />} />

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map(({ status, key, dot }) => {
          const col = tasks.filter((task) => task.status === status)
          return (
            <div key={status} className="grid content-start gap-3 rounded-3xl bg-white/35 p-3 backdrop-blur">
              <p className="flex items-center gap-2 px-2 pt-1 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                <span className={cn('size-2 rounded-full', dot)} /> {t(key)}
                <span className="ml-auto rounded-full bg-white/80 px-2 py-0.5 text-[10px]">{col.length}</span>
              </p>
              {col.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {col.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground">
                  {t('tasksMod.empty')}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
