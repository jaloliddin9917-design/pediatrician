import { useUnit } from 'effector-react'
import {
  Baby,
  Bell,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { $session, sessionCleared } from '@/entities/session/model'
import { LangSwitcher } from '@/features/lang-switch'
import { readJson, writeJson } from '@/shared/lib/storage'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'

export interface NavItem {
  to: string
  end?: boolean
  icon: LucideIcon
  key: string
}

export interface NavSection {
  labelKey?: string
  items: NavItem[]
}

function NavList({
  sections,
  collapsed,
  onNavigate,
}: {
  sections: NavSection[]
  collapsed: boolean
  onNavigate?: () => void
}) {
  const { t } = useTranslation()
  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-2">
      {sections.map((section, i) => (
        <div key={section.labelKey ?? i} className="grid gap-0.5">
          {section.labelKey && !collapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/80 uppercase">
              {t(section.labelKey)}
            </p>
          )}
          {section.labelKey && collapsed && <div className="mx-2 mb-1 border-t border-border/70" />}
          {section.items.map(({ to, end, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              title={collapsed ? t(key) : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/70 hover:text-foreground',
                  isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary',
                  collapsed && 'justify-center px-2',
                )
              }
            >
              <Icon className="size-4.5 shrink-0" />
              {!collapsed && <span className="truncate">{t(key)}</span>}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

export function AppShell({ sections }: { sections: NavSection[] }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [session, logout] = useUnit([$session, sessionCleared])
  const [collapsed, setCollapsed] = useState(() => readJson<boolean>('pedicare.sidebar') ?? false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      writeJson('pedicare.sidebar', !c)
      return !c
    })

  const doLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const userCard = (showText: boolean) => (
    <div className={cn('flex items-center gap-2.5 border-t border-border/70 p-3', !showText && 'justify-center')}>
      <Avatar className="size-9">
        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
          {session?.name?.[0] ?? '?'}
        </AvatarFallback>
      </Avatar>
      {showText && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{session?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{session?.email}</p>
        </div>
      )}
      {showText && (
        <Button variant="ghost" size="icon" aria-label={t('common.logout')} onClick={doLogout}>
          <LogOut className="size-4" />
        </Button>
      )}
    </div>
  )

  return (
    <div className="aurora flex min-h-screen">
      {/* desktop sidebar */}
      <aside
        className={cn(
          'glass sticky top-0 z-30 hidden h-screen flex-col rounded-none border-y-0 border-l-0 transition-all duration-300 lg:flex',
          collapsed ? 'w-[4.75rem]' : 'w-64',
        )}
      >
        <div className={cn('flex h-16 items-center gap-2 px-4', collapsed && 'justify-center px-0')}>
          <Link to="/" className="flex items-center gap-2 font-bold text-primary">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Baby className="size-5" />
            </span>
            {!collapsed && <span className="font-heading text-lg">{t('common.appName')}</span>}
          </Link>
        </div>
        <NavList sections={sections} collapsed={collapsed} />
        <div className="px-3 pb-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-muted-foreground"
            onClick={toggleCollapsed}
            aria-label={t('shell.collapse')}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!collapsed && t('shell.collapse')}
          </Button>
        </div>
        {userCard(!collapsed)}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* topbar */}
        <header className="glass sticky top-0 z-20 flex h-16 items-center gap-2 rounded-none border-x-0 border-t-0 px-4 md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t('shell.menu')}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
              <SheetTitle className="flex h-16 items-center gap-2 px-4 font-bold text-primary">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Baby className="size-5" />
                </span>
                <span className="font-heading text-lg">{t('common.appName')}</span>
              </SheetTitle>
              <NavList sections={sections} collapsed={false} onNavigate={() => setMobileOpen(false)} />
              {userCard(true)}
            </SheetContent>
          </Sheet>

          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="rounded-full bg-white/60 pl-9" placeholder={t('shell.search')} />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <LangSwitcher />
            <Button variant="ghost" size="icon" className="relative" aria-label={t('shell.notifications')}>
              <Bell className="size-4.5" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500" />
            </Button>
            <Avatar className="size-9 lg:hidden">
              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                {session?.name?.[0] ?? '?'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
