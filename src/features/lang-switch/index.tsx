import { useUnit } from 'effector-react'
import { $lang, langChanged, type Lang } from '@/entities/i18n/model'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ru', label: 'РУ' },
  { value: 'uz', label: 'UZ' },
]

export function LangSwitcher() {
  const [lang, onChange] = useUnit([$lang, langChanged])
  return (
    <Select value={lang} onValueChange={(v) => onChange(v as Lang)}>
      <SelectTrigger className="w-20" aria-label="Language">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGS.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
