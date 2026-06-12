import { CalendarDays, ClipboardList, LayoutDashboard, Users } from 'lucide-react'
import { AppShell, type NavSection } from '@/widgets/app-shell'

const SECTIONS: NavSection[] = [
  {
    labelKey: 'shell.care',
    items: [
      { to: '/doctor', end: true, icon: LayoutDashboard, key: 'nav.dashboard' },
      { to: '/doctor/queue', icon: ClipboardList, key: 'nav.queue' },
      { to: '/doctor/patients', icon: Users, key: 'nav.patients' },
      { to: '/doctor/schedule', icon: CalendarDays, key: 'nav.schedule' },
    ],
  },
]

export function DoctorLayout() {
  return <AppShell sections={SECTIONS} />
}
