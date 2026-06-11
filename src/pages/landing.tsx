import { useUnit } from 'effector-react'
import {
  ArrowRight,
  Baby,
  BookOpen,
  Bot,
  CalendarCheck,
  Check,
  ClipboardCheck,
  FilePen,
  FileText,
  LayoutGrid,
  ListChecks,
  Mail,
  MessageCircle,
  MessageSquare,
  Mic,
  Phone,
  PhoneCall,
  Printer,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { $session } from '@/entities/session/model'
import { LangSwitcher } from '@/features/lang-switch'
import { useRevealGroup } from '@/shared/lib/use-reveal'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

type VignetteKind =
  | 'scribe'
  | 'reception'
  | 'billing'
  | 'evidentia'
  | 'nurse'
  | 'comms'
  | 'canvas'
  | 'tasks'
  | 'forms'

interface Feature {
  icon: LucideIcon
  tint: string
  titleKey: string
  descKey: string
  vignette: VignetteKind
}

const CLINICAL: Feature[] = [
  { icon: Mic, tint: 'bg-sky-100 text-sky-600', titleKey: 'landing.fScribeT', descKey: 'landing.fScribeD', vignette: 'scribe' },
  { icon: PhoneCall, tint: 'bg-violet-100 text-violet-600', titleKey: 'landing.fReceptionT', descKey: 'landing.fReceptionD', vignette: 'reception' },
  { icon: FileText, tint: 'bg-emerald-100 text-emerald-600', titleKey: 'landing.fBillingT', descKey: 'landing.fBillingD', vignette: 'billing' },
  { icon: BookOpen, tint: 'bg-indigo-100 text-indigo-600', titleKey: 'landing.fEvidentiaT', descKey: 'landing.fEvidentiaD', vignette: 'evidentia' },
]

const OPERATIONS: Feature[] = [
  { icon: ClipboardCheck, tint: 'bg-orange-100 text-orange-600', titleKey: 'landing.fNurseT', descKey: 'landing.fNurseD', vignette: 'nurse' },
  { icon: Printer, tint: 'bg-sky-100 text-sky-600', titleKey: 'landing.fCommsT', descKey: 'landing.fCommsD', vignette: 'comms' },
  { icon: LayoutGrid, tint: 'bg-rose-100 text-rose-600', titleKey: 'landing.fCanvasT', descKey: 'landing.fCanvasD', vignette: 'canvas' },
  { icon: ListChecks, tint: 'bg-red-100 text-red-600', titleKey: 'landing.fTasksT', descKey: 'landing.fTasksD', vignette: 'tasks' },
  { icon: FilePen, tint: 'bg-amber-100 text-amber-600', titleKey: 'landing.fFormsT', descKey: 'landing.fFormsD', vignette: 'forms' },
]

function Vignette({ kind }: { kind: VignetteKind }) {
  switch (kind) {
    case 'scribe':
      return (
        <div className="flex h-10 items-end gap-1">
          {[0.5, 0.9, 0.6, 1, 0.7, 0.45, 0.8].map((h, i) => (
            <span
              key={i}
              className="anim-eq w-1.5 rounded-full bg-sky-400/80"
              style={{ height: `${h * 100}%`, animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      )
    case 'reception':
      return (
        <div className="grid gap-1">
          <span className="h-2 w-16 rounded-full bg-violet-200" />
          <span className="h-2 w-12 rounded-full bg-violet-300" />
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> 24/7
          </span>
        </div>
      )
    case 'billing':
      return (
        <div className="grid justify-items-end gap-1">
          <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700">R50.9</span>
          <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600">99214</span>
        </div>
      )
    case 'evidentia':
      return (
        <div className="grid w-20 gap-1">
          {['bg-amber-400 w-full', 'bg-slate-300 w-4/5', 'bg-orange-300 w-3/5', 'bg-slate-200 w-2/5'].map((c, i) => (
            <span key={i} className={cn('h-2 rounded-full', c)} />
          ))}
        </div>
      )
    case 'nurse':
      return (
        <div className="grid gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex items-center gap-1">
              <Check className="size-3 text-orange-500" />
              <span className="h-1.5 w-12 rounded-full bg-orange-100" />
            </span>
          ))}
        </div>
      )
    case 'comms':
      return (
        <div className="flex gap-1.5 text-sky-500">
          <Printer className="size-4" />
          <Mail className="size-4" />
          <MessageSquare className="size-4" />
          <Phone className="size-4" />
        </div>
      )
    case 'canvas':
      return (
        <div className="grid w-20 grid-cols-3 gap-0.5">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className={cn('h-3 rounded-sm', i % 3 === 0 ? 'bg-rose-200' : 'bg-rose-100/70')} />
          ))}
        </div>
      )
    case 'tasks':
      return (
        <div className="flex gap-1.5">
          {[3, 2, 1].map((n, col) => (
            <div key={col} className="grid content-start gap-1">
              {Array.from({ length: n }, (_, i) => (
                <span key={i} className={cn('h-2 w-6 rounded-sm', col === 2 ? 'bg-emerald-200' : 'bg-red-100')} />
              ))}
            </div>
          ))}
        </div>
      )
    case 'forms':
      return (
        <div className="grid w-20 gap-1">
          {['w-full', 'w-4/5', 'w-3/5'].map((w, i) => (
            <span key={i} className={cn('h-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-100', w)} />
          ))}
        </div>
      )
  }
}

function FeatureRow({ feature }: { feature: Feature }) {
  const { t } = useTranslation()
  const Icon = feature.icon
  return (
    <div className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-white/80 hover:shadow-lg hover:shadow-primary/5">
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
          feature.tint,
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{t(feature.titleKey)}</p>
        <p className="text-sm text-muted-foreground">{t(feature.descKey)}</p>
      </div>
      <div className="hidden shrink-0 opacity-70 transition-opacity group-hover:opacity-100 sm:block">
        <Vignette kind={feature.vignette} />
      </div>
    </div>
  )
}

function FloatingTile({
  icon: Icon,
  tint,
  className,
  delay,
}: {
  icon: LucideIcon
  tint: string
  className: string
  delay: string
}) {
  return (
    <div
      className={cn('glass anim-float absolute hidden items-center justify-center rounded-2xl p-3 lg:flex', className)}
      style={{ animationDelay: delay }}
    >
      <span className={cn('flex size-9 items-center justify-center rounded-xl', tint)}>
        <Icon className="size-4.5" />
      </span>
    </div>
  )
}

function ChatDemo() {
  const { t } = useTranslation()
  return (
    <div className="glass w-full max-w-md rounded-3xl p-2">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="size-2.5 rounded-full bg-rose-300" />
        <span className="size-2.5 rounded-full bg-amber-300" />
        <span className="size-2.5 rounded-full bg-emerald-300" />
        <span className="ml-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Bot className="size-3.5 text-primary" /> {t('landing.chatDemoTitle')}
        </span>
        <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> online
        </span>
      </div>
      <div className="grid gap-2.5 rounded-2xl bg-white/60 p-4">
        <div className="anim-pop max-w-[85%] self-start rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5 text-sm" style={{ animationDelay: '400ms' }}>
          {t('landing.chatDemo1')}
        </div>
        <div className="anim-pop max-w-[85%] self-end rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground" style={{ animationDelay: '900ms' }}>
          {t('landing.chatDemo2')}
        </div>
        <div className="anim-pop max-w-[85%] self-start rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5 text-sm" style={{ animationDelay: '1400ms' }}>
          {t('landing.chatDemo3')}
        </div>
        <div className="anim-pop max-w-[85%] self-end rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground" style={{ animationDelay: '1900ms' }}>
          {t('landing.chatDemo4')}
        </div>
        <div className="anim-pop flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm font-medium text-amber-800" style={{ animationDelay: '2500ms' }}>
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          {t('landing.chatDemoVerdict')}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { t } = useTranslation()
  const session = useUnit($session)
  const revealRef = useRevealGroup()
  const dashboardPath = session?.role === 'doctor' ? '/doctor' : '/parent'
  const marquee = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'].map((k) => t(`landing.${k}`))

  return (
    <div ref={revealRef} className="aurora relative min-h-screen overflow-x-clip">
      {/* header */}
      <header className="sticky top-4 z-30 px-4">
        <div className="glass mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 rounded-full px-3 sm:pl-5">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-bold text-primary">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Baby className="size-4.5" />
            </span>
            <span className="font-heading hidden text-lg tracking-tight whitespace-nowrap min-[420px]:inline">
              {t('common.appName')}
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">{t('landing.navFeatures')}</a>
            <a href="#how" className="transition-colors hover:text-foreground">{t('landing.navHow')}</a>
            <a href="#doctors" className="transition-colors hover:text-foreground">{t('landing.navDoctors')}</a>
          </nav>
          <div className="flex items-center gap-1.5">
            <LangSwitcher />
            {session ? (
              <Button asChild className="rounded-full">
                <Link to={dashboardPath}>
                  {t('landing.openDashboard')} <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden rounded-full sm:inline-flex">
                  <Link to="/auth/login">{t('landing.login')}</Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link to="/auth/register">{t('landing.getStarted')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* hero */}
        <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
          <FloatingTile icon={Mic} tint="bg-sky-100 text-sky-600" className="top-16 right-[44%]" delay="0s" />
          <FloatingTile icon={BookOpen} tint="bg-indigo-100 text-indigo-600" className="top-10 right-6" delay="-2.5s" />
          <FloatingTile icon={ListChecks} tint="bg-red-100 text-red-600" className="right-[2%] bottom-16" delay="-4.5s" />

          <div className="flex min-w-0 flex-col gap-6">
            <span className="anim-fade-up inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur">
              <Sparkles className="size-3.5" /> {t('landing.badge')}
            </span>
            <h1 className="anim-fade-up text-4xl leading-[1.08] font-bold tracking-tight sm:text-6xl" style={{ animationDelay: '120ms' }}>
              {t('landing.heroLead')} <span className="ink-gradient">{t('landing.heroHighlight')}</span>
            </h1>
            <p className="anim-fade-up max-w-lg text-lg text-muted-foreground" style={{ animationDelay: '240ms' }}>
              {t('landing.heroSubtitle')}
            </p>
            <div className="anim-fade-up flex flex-wrap gap-3" style={{ animationDelay: '360ms' }}>
              <Button size="lg" asChild className="h-12 rounded-full px-6 shadow-xl shadow-primary/25">
                <Link to="/auth/register">
                  <Baby className="size-5" /> {t('landing.ctaParent')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 rounded-full border-primary/25 bg-white/60 px-6 backdrop-blur">
                <Link to="/auth/register">
                  <Stethoscope className="size-5" /> {t('landing.ctaDoctor')}
                </Link>
              </Button>
            </div>
            <div className="anim-fade-up flex items-center gap-3 pt-1" style={{ animationDelay: '480ms' }}>
              <div className="flex -space-x-2">
                {['D', 'A', 'S', 'M'].map((ch, i) => (
                  <span
                    key={ch}
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white',
                      ['bg-sky-400', 'bg-violet-400', 'bg-emerald-400', 'bg-rose-400'][i],
                    )}
                  >
                    {ch}
                  </span>
                ))}
              </div>
              <div>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </span>
                <p className="text-xs text-muted-foreground">{t('landing.trustedBy')}</p>
              </div>
            </div>
          </div>

          <div className="anim-fade-up flex justify-center lg:justify-end" style={{ animationDelay: '300ms' }}>
            <ChatDemo />
          </div>
        </section>

        {/* stats */}
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <div className="glass reveal grid grid-cols-2 gap-6 rounded-3xl p-7 sm:grid-cols-4">
            {[
              ['10k+', 'landing.statFamilies'],
              ['50+', 'landing.statSpecialties'],
              ['24/7', 'landing.statTriage'],
              ['3', 'landing.statLangs'],
            ].map(([value, key]) => (
              <div key={key} className="text-center">
                <p className="font-heading text-3xl font-bold text-primary">{value}</p>
                <p className="text-xs text-muted-foreground">{t(key)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* marquee */}
        <section className="overflow-hidden border-y border-white/60 bg-white/40 py-4 backdrop-blur">
          <div className="anim-marquee flex w-max gap-10">
            {[...marquee, ...marquee].map((m, i) => (
              <span key={i} className="flex items-center gap-2 text-sm font-medium whitespace-nowrap text-muted-foreground">
                <Stethoscope className="size-3.5 text-primary/60" /> {m}
              </span>
            ))}
          </div>
        </section>

        {/* features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="reveal mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">{t('landing.featuresTitle')}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{t('landing.featuresSubtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass reveal rounded-3xl p-4 sm:p-6">
              <p className="px-4 pt-2 pb-3 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                {t('landing.clinical')}
              </p>
              <div className="grid gap-1">
                {CLINICAL.map((f) => (
                  <FeatureRow key={f.titleKey} feature={f} />
                ))}
              </div>
            </div>
            <div className="glass reveal rounded-3xl p-4 sm:p-6" style={{ transitionDelay: '120ms' }}>
              <p className="px-4 pt-2 pb-3 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                {t('landing.operations')}
              </p>
              <div className="grid gap-1">
                {OPERATIONS.map((f) => (
                  <FeatureRow key={f.titleKey} feature={f} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* product tour — two sides */}
        <section id="doctors" className="mx-auto max-w-6xl px-4 pb-20 md:pb-28">
          <div className="reveal mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">{t('landing.tourTitle')}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{t('landing.tourSubtitle')}</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* parent panel */}
            <div className="glass reveal group overflow-hidden rounded-3xl">
              <div className="flex h-44 items-center justify-center gap-3 bg-gradient-to-br from-sky-100/80 via-violet-50 to-transparent px-6">
                <div className="w-44 -rotate-3 rounded-2xl bg-white/90 p-3 shadow-lg transition-transform group-hover:-rotate-6">
                  <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold text-primary">
                    <MessageCircle className="size-3" /> AI Check
                  </p>
                  <span className="mb-1 block h-2 w-4/5 rounded-full bg-secondary" />
                  <span className="mb-2 block h-2 w-3/5 rounded-full bg-secondary" />
                  <span className="inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                    {t('urgency.yellow')}
                  </span>
                </div>
                <div className="w-40 rotate-2 rounded-2xl bg-white/90 p-3 shadow-lg transition-transform group-hover:rotate-4">
                  <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                    <CalendarCheck className="size-3" /> 11:30 · Dr. K.
                  </p>
                  <span className="mb-1 block h-2 w-3/4 rounded-full bg-emerald-100" />
                  <span className="block h-2 w-1/2 rounded-full bg-emerald-50" />
                </div>
              </div>
              <div className="grid gap-4 p-7">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Baby className="size-5" />
                </span>
                <h3 className="font-heading text-2xl font-bold">{t('landing.parentsTitle')}</h3>
                <ul className="grid gap-2.5 text-sm">
                  {['landing.parentsB1', 'landing.parentsB2', 'landing.parentsB3', 'landing.parentsB4'].map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {t(key)}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-1 w-fit rounded-full">
                  <Link to="/auth/register">
                    {t('landing.parentsCta')} <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
            {/* doctor panel */}
            <div className="glass reveal group overflow-hidden rounded-3xl" style={{ transitionDelay: '120ms' }}>
              <div className="flex h-44 items-center justify-center bg-gradient-to-br from-violet-100/80 via-rose-50 to-transparent px-6">
                <div className="w-64 rounded-2xl bg-white/90 p-3 shadow-lg transition-transform group-hover:scale-105">
                  <p className="mb-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    {t('nav.queue')}
                  </p>
                  {[
                    ['bg-red-400', 'w-3/4'],
                    ['bg-amber-400', 'w-2/3'],
                    ['bg-emerald-400', 'w-1/2'],
                  ].map(([c, w], i) => (
                    <div key={i} className="mb-1.5 flex items-center gap-2">
                      <span className={cn('h-6 w-1 rounded-full', c)} />
                      <span className={cn('block h-2 rounded-full bg-muted', w)} />
                      <span className="ml-auto h-4 w-10 rounded-md bg-secondary" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 p-7">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-foreground text-white">
                  <Stethoscope className="size-5" />
                </span>
                <h3 className="font-heading text-2xl font-bold">{t('landing.doctorsTitle')}</h3>
                <ul className="grid gap-2.5 text-sm">
                  {['landing.doctorsB1', 'landing.doctorsB2', 'landing.doctorsB3', 'landing.doctorsB4'].map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent-foreground" /> {t(key)}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-1 w-fit rounded-full border-accent-foreground/30 bg-white/60 text-accent-foreground hover:bg-accent">
                  <Link to="/auth/register">
                    {t('landing.doctorsCta')} <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* how it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 pb-20 md:pb-28">
          <h2 className="reveal mb-14 text-center text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            {t('landing.howTitle')}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: MessageCircle, tint: 'bg-sky-100 text-sky-600', title: 'landing.how1T', desc: 'landing.how1D' },
              { icon: ShieldCheck, tint: 'bg-violet-100 text-violet-600', title: 'landing.how2T', desc: 'landing.how2D' },
              { icon: CalendarCheck, tint: 'bg-emerald-100 text-emerald-600', title: 'landing.how3T', desc: 'landing.how3D' },
            ].map(({ icon: Icon, tint, title, desc }, i) => (
              <div key={title} className="glass reveal relative grid gap-3 rounded-3xl p-7" style={{ transitionDelay: `${i * 120}ms` }}>
                <span className="font-heading absolute top-5 right-6 text-5xl font-bold text-primary/10">{i + 1}</span>
                <span className={cn('flex size-12 items-center justify-center rounded-2xl', tint)}>
                  <Icon className="size-6" />
                </span>
                <h3 className="text-lg font-bold">{t(title)}</h3>
                <p className="text-sm text-muted-foreground">{t(desc)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* testimonials */}
        <section className="mx-auto max-w-6xl px-4 pb-20 md:pb-28">
          <h2 className="reveal mb-14 text-center text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            {t('landing.testiTitle')}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {(['q1', 'q2', 'q3'] as const).map((q, i) => (
              <figure key={q} className="glass reveal grid content-start gap-4 rounded-3xl p-7" style={{ transitionDelay: `${i * 120}ms` }}>
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, s) => (
                    <Star key={s} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </span>
                <blockquote className="text-sm leading-relaxed">“{t(`landing.${q}`)}”</blockquote>
                <figcaption className="mt-auto flex items-center gap-3">
                  <span
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full font-bold text-white',
                      ['bg-sky-400', 'bg-violet-400', 'bg-emerald-400'][i],
                    )}
                  >
                    {t(`landing.${q}n`)[0]}
                  </span>
                  <span>
                    <p className="text-sm font-semibold">{t(`landing.${q}n`)}</p>
                    <p className="text-xs text-muted-foreground">{t(`landing.${q}r`)}</p>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="reveal relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-violet-500 to-rose-400 px-8 py-16 text-center text-white shadow-2xl shadow-primary/30">
            <div aria-hidden className="absolute inset-0 opacity-20">
              <div className="anim-blob absolute -top-20 -left-20 size-80 rounded-full bg-white blur-3xl" />
              <div className="anim-blob absolute -right-20 -bottom-24 size-96 rounded-full bg-white blur-3xl" style={{ animationDelay: '-9s' }} />
            </div>
            <div className="relative grid justify-items-center gap-4">
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">{t('landing.ctaTitle')}</h2>
              <p className="text-white/85">{t('landing.ctaSub')}</p>
              <Button size="lg" asChild className="mt-2 h-12 rounded-full bg-white px-7 text-primary shadow-lg hover:bg-white/90">
                <Link to={session ? dashboardPath : '/auth/register'}>
                  {t('landing.ctaBtn')} <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="relative z-10 border-t border-white/60 bg-white/40 py-10 backdrop-blur">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1.4fr_1fr_auto]">
          <div className="grid content-start gap-3">
            <div className="flex items-center gap-2 font-bold text-primary">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Baby className="size-4.5" />
              </span>
              <span className="font-heading text-lg">{t('common.appName')}</span>
            </div>
            <p className="max-w-sm text-xs text-muted-foreground">{t('landing.footerDisclaimer')}</p>
          </div>
          <nav className="grid content-start gap-2 text-sm text-muted-foreground">
            <a href="#features" className="w-fit transition-colors hover:text-foreground">{t('landing.navFeatures')}</a>
            <a href="#how" className="w-fit transition-colors hover:text-foreground">{t('landing.navHow')}</a>
            <a href="#doctors" className="w-fit transition-colors hover:text-foreground">{t('landing.navDoctors')}</a>
          </nav>
          <div className="grid content-start justify-items-start gap-3">
            <LangSwitcher />
            <p className="text-xs text-muted-foreground">© 2026 PediCare AI. {t('landing.footerRights')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
