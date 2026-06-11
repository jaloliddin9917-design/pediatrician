import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/shared/ui/button'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <span className="text-6xl">🩺</span>
      <h1 className="text-2xl font-semibold">{t('notFound.title')}</h1>
      <Button asChild>
        <Link to="/">{t('notFound.goHome')}</Link>
      </Button>
    </div>
  )
}
