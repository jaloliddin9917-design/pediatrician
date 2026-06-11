import { Baby, History, Home, MessageCircle, Stethoscope, Syringe } from 'lucide-react'
import { AppShell, type NavSection } from '@/widgets/app-shell'

const SECTIONS: NavSection[] = [
  {
    items: [
      { to: '/parent', end: true, icon: Home, key: 'nav.home' },
      { to: '/parent/chat', icon: MessageCircle, key: 'nav.aiChat' },
      { to: '/parent/doctors', icon: Stethoscope, key: 'nav.doctors' },
      { to: '/parent/children', icon: Baby, key: 'nav.children' },
      { to: '/parent/history', icon: History, key: 'nav.history' },
      { to: '/parent/vaccines', icon: Syringe, key: 'nav.vaccines' },
    ],
  },
]

export function ParentLayout() {
  return <AppShell sections={SECTIONS} />
}
