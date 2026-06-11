import { useUnit } from 'effector-react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { $activeChildId, $children, activeChildSet, childRemoved, childSaved } from '@/entities/child/model'
import type { Child } from '@/shared/api'
import { formatAge } from '@/shared/lib/age'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { EmptyState } from '@/shared/ui/empty-state'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { PageHeader } from '@/shared/ui/page-header'

function ChildDialog({ child }: { child?: Child }) {
  const { t } = useTranslation()
  const save = useUnit(childSaved)
  const [open, setOpen] = useState(false)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    save({
      id: child?.id ?? crypto.randomUUID(),
      name: String(f.get('name')),
      birthDate: String(f.get('birthDate')),
      weightKg: f.get('weightKg') ? Number(f.get('weightKg')) : undefined,
      heightCm: f.get('heightCm') ? Number(f.get('heightCm')) : undefined,
      allergies: String(f.get('allergies') ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {child ? (
          <Button variant="ghost" size="icon" aria-label={t('children.editChild')}>
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> {t('children.addChild')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{child ? t('children.editChild') : t('children.addChild')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="name">{t('children.name')}</Label>
            <Input id="name" name="name" required defaultValue={child?.name} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="birthDate">{t('children.birthDate')}</Label>
            <Input id="birthDate" name="birthDate" type="date" required defaultValue={child?.birthDate} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="weightKg">{t('children.weight')}</Label>
              <Input id="weightKg" name="weightKg" type="number" step="0.1" min="0" defaultValue={child?.weightKg} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="heightCm">{t('children.height')}</Label>
              <Input id="heightCm" name="heightCm" type="number" min="0" defaultValue={child?.heightCm} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="allergies">{t('children.allergies')}</Label>
            <Input id="allergies" name="allergies" defaultValue={child?.allergies.join(', ')} />
          </div>
          <Button type="submit">{t('common.save')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ChildrenPage() {
  const { t } = useTranslation()
  const [children, activeId, setActive, remove] = useUnit([$children, $activeChildId, activeChildSet, childRemoved])

  return (
    <div>
      <PageHeader title={t('children.title')} action={<ChildDialog />} />
      {children.length === 0 ? (
        <EmptyState icon="👶" text={t('children.empty')} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-gradient-to-br from-sky-400 to-violet-400 text-lg font-bold text-white">{child.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{child.name}</p>
                    {child.id === activeId && <Badge>{t('children.active')}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatAge(child.birthDate)}
                    {child.weightKg ? ` · ${child.weightKg} kg` : ''}
                    {child.heightCm ? ` · ${child.heightCm} cm` : ''}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {child.allergies.map((a) => (
                      <Badge key={a} variant="outline">
                        {a}
                      </Badge>
                    ))}
                  </div>
                  {child.id !== activeId && (
                    <Button variant="link" className="h-auto p-0 text-sm" onClick={() => setActive(child.id)}>
                      {t('children.makeActive')}
                    </Button>
                  )}
                </div>
                <div className="flex gap-1">
                  <ChildDialog child={child} />
                  <Button variant="ghost" size="icon" aria-label="delete" onClick={() => remove(child.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
