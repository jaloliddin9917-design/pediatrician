import { useUnit } from 'effector-react'
import { Baby, Stethoscope } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { loginFx } from '@/features/auth/model'
import { LangSwitcher } from '@/features/lang-switch'
import type { UserRole } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [login, pending] = useUnit([loginFx, loginFx.pending])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('parent')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const user = await login({ email, role })
    navigate(user.role === 'doctor' ? '/doctor' : '/parent', { replace: true })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      <div className="absolute top-4 right-4">
        <LangSwitcher />
      </div>
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
        <Baby className="size-8" /> {t('common.appName')}
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('auth.loginTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <TabsList className="w-full">
                <TabsTrigger value="parent" className="flex-1">
                  <Baby className="size-4" /> {t('auth.iAmParent')}
                </TabsTrigger>
                <TabsTrigger value="doctor" className="flex-1">
                  <Stethoscope className="size-4" /> {t('auth.iAmDoctor')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="grid gap-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" disabled={pending}>
              {t('auth.loginBtn')}
            </Button>
            <Button variant="link" asChild>
              <Link to="/auth/register">{t('auth.noAccount')}</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
