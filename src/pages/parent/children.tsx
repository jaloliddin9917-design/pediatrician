import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/ui/page-header'

export default function ChildrenPage() {
  const { t } = useTranslation()
  return <PageHeader title={t('children.title')} />
}
