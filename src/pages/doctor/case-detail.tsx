import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/ui/page-header'

export default function CaseDetailPage() {
  const { t } = useTranslation()
  return <PageHeader title={t('doctor.caseTitle')} />
}
