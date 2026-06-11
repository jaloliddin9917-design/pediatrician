import { useUnit } from 'effector-react'
import { CalendarDays, ClipboardList, LogOut, Stethoscope } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { $session, sessionCleared } from '@/entities/session/model'
import { LangSwitcher } from '@/features/lang-switch'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

const NAV = [
  { to: '/doctor', end: true, icon: ClipboardList, key: 'nav.queue' },
  { to: '/doctor/schedule', end: false, icon: CalendarDays, key: 'nav.schedule' },
]

export function DoctorLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [session, logout] = useUnit([$session, sessionCleared])

  const navLinks = (compact: boolean) =>
    NAV.map(({ to, end, icon: Icon, key }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground',
            isActive && 'bg-secondary text-foreground',
            compact && 'px-2 py-1.5',
          )
        }
      >
        <Icon className="size-4" /> {t(key)}
      </NavLink>
    ))

  const logoutBtn = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t('common.logout')}
      onClick={() => {
        logout()
        navigate('/auth/login')
      }}
    >
      <LogOut className="size-4" />
    </Button>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 flex-col border-r p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 font-bold text-primary">
          <Stethoscope className="size-6" /> {t('common.appName')}
        </div>
        <nav className="grid gap-1">{navLinks(false)}</nav>
        <div className="mt-auto grid gap-2">
          <p className="truncate text-sm text-muted-foreground">{session?.name}</p>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            {logoutBtn}
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-2 border-b px-4 md:hidden">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Stethoscope className="size-5" /> {t('common.appName')}
          </div>
          <div className="flex items-center gap-1">
            {navLinks(true)}
            <LangSwitcher />
            {logoutBtn}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
