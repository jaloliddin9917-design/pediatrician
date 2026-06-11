import { createEvent, createStore } from 'effector'
import i18n from '@/shared/i18n'
import { readJson, writeJson } from '@/shared/lib/storage'

export type Lang = 'en' | 'ru' | 'uz'

export const langChanged = createEvent<Lang>()

export const $lang = createStore<Lang>(readJson<Lang>('pedicare.lang') ?? 'en')
  .on(langChanged, (_, lang) => lang)

$lang.watch((lang) => {
  writeJson('pedicare.lang', lang)
  if (i18n.language !== lang) void i18n.changeLanguage(lang)
})
