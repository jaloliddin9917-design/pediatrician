import { CalendarDays, ClipboardList } from 'lucide-react'
import { AppShell, type NavSection } from '@/widgets/app-shell'

const SECTIONS: NavSection[] = [
  {
    labelKey: 'shell.care',
    items: [
      { to: '/doctor', end: true, icon: ClipboardList, key: 'nav.queue' },
      { to: '/doctor/schedule', icon: CalendarDays, key: 'nav.schedule' },
    ],
  },
]

export function DoctorLayout() {
  return <AppShell sections={SECTIONS} />
}
