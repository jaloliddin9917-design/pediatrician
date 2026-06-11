import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/ui/page-header'

export default function FormsPage() {
  const { t } = useTranslation()
  return <PageHeader title={t('nav.forms')} />
}
