import type { Urgency } from '@/shared/api'

export type SymptomId =
  | 'fever'
  | 'cough'
  | 'rash'
  | 'vomit'
  | 'diarrhea'
  | 'ear'
  | 'breathing'
  | 'drowsy'

export interface Assessment {
  urgency: Urgency
  symptoms: SymptomId[]
}

const URGENCY_OF: Record<SymptomId, Urgency> = {
  fever: 'yellow',
  cough: 'green',
  rash: 'yellow',
  vomit: 'yellow',
  diarrhea: 'yellow',
  ear: 'yellow',
  breathing: 'red',
  drowsy: 'red',
}

// lowercase substrings matched against the normalized text; en / ru / uz word stems
const KEYWORDS: Record<SymptomId, string[]> = {
  fever: ['fever', 'temperature', '38', '39', '40', 'температур', 'жар', 'isitma', 'harorat'],
  cough: ['cough', 'кашл', "yo'tal", 'yotal', 'yutal'],
  rash: ['rash', 'spots', 'сыпь', 'пятн', 'toshma'],
  vomit: ['vomit', 'threw up', 'throw up', 'рвот', 'вырвало', 'тошнит', 'qus'],
  diarrhea: ['diarrhea', 'diarrhoea', 'loose stool', 'понос', 'жидкий стул', 'ich ket', 'diareya'],
  ear: ['ear', 'ухо', 'уши', 'quloq'],
  breathing: ['breath', 'wheez', 'дыш', 'хрип', 'задыха', 'nafas', 'xirilla'],
  drowsy: ['drowsy', 'lethargic', 'unresponsive', 'very sleepy', 'сонлив', 'вял', 'не просыпа', 'uyquchan', 'behol', 'lanj'],
}

const RANK: Record<Urgency, number> = { green: 0, yellow: 1, red: 2 }

export function assess(text: string): Assessment {
  const normalized = text.toLowerCase().replace(/ё/g, 'е').replace(/’/g, "'")
  const symptoms = (Object.keys(KEYWORDS) as SymptomId[]).filter((id) =>
    KEYWORDS[id].some((kw) => normalized.includes(kw)),
  )
  const urgency = symptoms.reduce<Urgency>(
    (worst, id) => (RANK[URGENCY_OF[id]] > RANK[worst] ? URGENCY_OF[id] : worst),
    'green',
  )
  return { urgency, symptoms }
}
