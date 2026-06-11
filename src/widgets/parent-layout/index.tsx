import { useUnit } from 'effector-react'
import { Baby, History, Home, LogOut, MessageCircle, Stethoscope, Syringe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { sessionCleared } from '@/entities/session/model'
import { LangSwitcher } from '@/features/lang-switch'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

const NAV = [
  { to: '/parent', end: true, icon: Home, key: 'nav.home' },
  { to: '/parent/chat', end: false, icon: MessageCircle, key: 'nav.aiChat' },
  { to: '/parent/doctors', end: false, icon: Stethoscope, key: 'nav.doctors' },
  { to: '/parent/children', end: false, icon: Baby, key: 'nav.children' },
  { to: '/parent/history', end: false, icon: History, key: 'nav.history' },
  { to: '/parent/vaccines', end: false, icon: Syringe, key: 'nav.vaccines' },
]

export function ParentLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useUnit(sessionCleared)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Baby className="size-6" /> {t('common.appName')}
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ to, end, icon: Icon, key }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground',
                    isActive && 'bg-secondary text-foreground',
                  )
                }
              >
                <Icon className="size-4" /> {t(key)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LangSwitcher />
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
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-6 border-t bg-background py-1 md:hidden">
        {NAV.map(({ to, end, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-0.5 py-1 text-[10px] text-muted-foreground', isActive && 'text-primary')
            }
          >
            <Icon className="size-5" /> {t(key)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
