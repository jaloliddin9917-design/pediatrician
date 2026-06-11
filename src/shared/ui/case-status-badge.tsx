import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/utils'
import type { CaseStatus } from '@/shared/api/types'
import { Badge } from '@/shared/ui/badge'

const MAP: Record<CaseStatus, { key: string; cls: string }> = {
  new: { key: 'doctor.statusNew', cls: 'bg-sky-100 text-sky-700' },
  accepted: { key: 'doctor.statusAccepted', cls: 'bg-amber-100 text-amber-700' },
  closed: { key: 'doctor.statusClosed', cls: 'bg-muted text-muted-foreground' },
}

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const { t } = useTranslation()
  return <Badge className={cn('border-transparent', MAP[status].cls)}>{t(MAP[status].key)}</Badge>
}
