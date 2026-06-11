import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/ui/page-header'

export default function BillingPage() {
  const { t } = useTranslation()
  return <PageHeader title={t('nav.billing')} />
}
