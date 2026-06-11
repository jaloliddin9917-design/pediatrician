import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/utils'
import type { Urgency } from '@/shared/api/types'
import { Badge } from '@/shared/ui/badge'

const STYLES: Record<Urgency, string> = {
  green: 'bg-emerald-100 text-emerald-700',
  yellow: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const { t } = useTranslation()
  return <Badge className={cn('border-transparent', STYLES[urgency])}>{t(`urgency.${urgency}`)}</Badge>
}
