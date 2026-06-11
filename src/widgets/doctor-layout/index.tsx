import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FilePen,
  FileText,
  LayoutGrid,
  ListChecks,
  Mic,
  PhoneCall,
  Printer,
} from 'lucide-react'
import { AppShell, type NavSection } from '@/widgets/app-shell'

const SECTIONS: NavSection[] = [
  {
    labelKey: 'shell.care',
    items: [
      { to: '/doctor', end: true, icon: ClipboardList, key: 'nav.queue' },
      { to: '/doctor/schedule', icon: CalendarDays, key: 'nav.schedule' },
    ],
  },
  {
    labelKey: 'shell.clinicalAi',
    items: [
      { to: '/doctor/scribe', icon: Mic, key: 'nav.scribe' },
      { to: '/doctor/receptionist', icon: PhoneCall, key: 'nav.receptionist' },
      { to: '/doctor/billing', icon: FileText, key: 'nav.billing' },
      { to: '/doctor/evidentia', icon: BookOpen, key: 'nav.evidentia' },
    ],
  },
  {
    labelKey: 'shell.operationsAi',
    items: [
      { to: '/doctor/nurse', icon: ClipboardCheck, key: 'nav.nurse' },
      { to: '/doctor/comms', icon: Printer, key: 'nav.comms' },
      { to: '/doctor/canvas', icon: LayoutGrid, key: 'nav.canvas' },
      { to: '/doctor/tasks', icon: ListChecks, key: 'nav.tasks' },
      { to: '/doctor/forms', icon: FilePen, key: 'nav.forms' },
    ],
  },
]

export function DoctorLayout() {
  return <AppShell sections={SECTIONS} />
}
