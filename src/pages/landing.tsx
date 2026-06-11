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
  MessageCircle,
  Mic,
  PhoneCall,
  Printer,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { $session } from '@/entities/session/model'
import { LangSwitcher } from '@/features/lang-switch'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

interface Feature {
  icon: LucideIcon
  tint: string
  titleKey: string
  descKey: string
}

const CLINICAL: Feature[] = [
  { icon: Mic, tint: 'bg-sky-100 text-sky-600', titleKey: 'landing.fScribeT', descKey: 'landing.fScribeD' },
  { icon: PhoneCall, tint: 'bg-violet-100 text-violet-600', titleKey: 'landing.fReceptionT', descKey: 'landing.fReceptionD' },
  { icon: FileText, tint: 'bg-emerald-100 text-emerald-600', titleKey: 'landing.fBillingT', descKey: 'landing.fBillingD' },
  { icon: BookOpen, tint: 'bg-indigo-100 text-indigo-600', titleKey: 'landing.fEvidentiaT', descKey: 'landing.fEvidentiaD' },
]

const OPERATIONS: Feature[] = [
  { icon: ClipboardCheck, tint: 'bg-orange-100 text-orange-600', titleKey: 'landing.fNurseT', descKey: 'landing.fNurseD' },
  { icon: Printer, tint: 'bg-sky-100 text-sky-600', titleKey: 'landing.fCommsT', descKey: 'landing.fCommsD' },
  { icon: LayoutGrid, tint: 'bg-rose-100 text-rose-600', titleKey: 'landing.fCanvasT', descKey: 'landing.fCanvasD' },
  { icon: ListChecks, tint: 'bg-red-100 text-red-600', titleKey: 'landing.fTasksT', descKey: 'landing.fTasksD' },
  { icon: FilePen, tint: 'bg-amber-100 text-amber-600', titleKey: 'landing.fFormsT', descKey: 'landing.fFormsD' },
]

function FeatureRow({ feature, delay }: { feature: Feature; delay: number }) {
  const { t } = useTranslation()
  const Icon = feature.icon
  return (
    <div
      className="anim-fade-up group flex gap-4 rounded-2xl p-4 transition-colors hover:bg-white/70"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
          feature.tint,
        )}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <p className="font-semibold">{t(feature.titleKey)}</p>
        <p className="text-sm text-muted-foreground">{t(feature.descKey)}</p>
      </div>
    </div>
  )
}

function ChatDemo() {
  const { t } = useTranslation()
  return (
    <Card className="anim-float w-full max-w-md border-primary/20 bg-white/80 shadow-xl shadow-primary/10 backdrop-blur">
      <CardContent className="grid gap-3 p-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </div>
          <p className="text-sm font-semibold">{t('landing.chatDemoTitle')}</p>
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600">
            <span className="size-2 animate-pulse rounded-full bg-emerald-500" /> online
          </span>
        </div>
        <div className="anim-fade-up max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-secondary px-4 py-2 text-sm" style={{ animationDelay: '300ms' }}>
          {t('landing.chatDemo1')}
        </div>
        <div className="anim-fade-up max-w-[85%] self-end rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground" style={{ animationDelay: '700ms' }}>
          {t('landing.chatDemo2')}
        </div>
        <div className="anim-fade-up max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-secondary px-4 py-2 text-sm" style={{ animationDelay: '1100ms' }}>
          {t('landing.chatDemo3')}
        </div>
        <div className="anim-fade-up max-w-[85%] self-end rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground" style={{ animationDelay: '1500ms' }}>
          {t('landing.chatDemo4')}
        </div>
        <div className="anim-fade-up rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800" style={{ animationDelay: '2000ms' }}>
          {t('landing.chatDemoVerdict')}
        </div>
      </CardContent>
    </Card>
  )
}

export default function LandingPage() {
  const { t } = useTranslation()
  const session = useUnit($session)
  const dashboardPath = session?.role === 'doctor' ? '/doctor' : '/parent'

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      {/* decorative gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="anim-blob absolute -top-32 -left-32 size-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="anim-blob absolute top-40 -right-40 size-[32rem] rounded-full bg-accent blur-3xl" style={{ animationDelay: '-6s' }} />
        <div className="anim-blob absolute bottom-0 left-1/3 size-[24rem] rounded-full bg-sky-100/80 blur-3xl" style={{ animationDelay: '-12s' }} />
      </div>

      {/* header */}
      <header className="sticky top-0 z-20 border-b border-primary/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <Baby className="size-7" /> {t('common.appName')}
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">{t('landing.navFeatures')}</a>
            <a href="#how" className="transition-colors hover:text-foreground">{t('landing.navHow')}</a>
            <a href="#doctors" className="transition-colors hover:text-foreground">{t('landing.navDoctors')}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            {session ? (
              <Button asChild>
                <Link to={dashboardPath}>
                  {t('landing.openDashboard')} <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link to="/auth/login">{t('landing.login')}</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/register">{t('landing.getStarted')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex min-w-0 flex-col gap-6">
            <Badge variant="secondary" className="anim-fade-up w-fit gap-1.5 rounded-full px-3 py-1 text-primary">
              <ShieldCheck className="size-3.5" /> {t('landing.badge')}
            </Badge>
            <h1 className="anim-fade-up text-4xl leading-tight font-bold text-balance sm:text-5xl" style={{ animationDelay: '100ms' }}>
              {t('landing.heroTitle')}
            </h1>
            <p className="anim-fade-up max-w-lg text-lg text-muted-foreground" style={{ animationDelay: '200ms' }}>
              {t('landing.heroSubtitle')}
            </p>
            <div className="anim-fade-up flex flex-wrap gap-3" style={{ animationDelay: '300ms' }}>
              <Button size="lg" asChild className="rounded-full shadow-lg shadow-primary/25">
                <Link to="/auth/register">
                  <Baby className="size-5" /> {t('landing.ctaParent')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full">
                <Link to="/auth/register">
                  <Stethoscope className="size-5" /> {t('landing.ctaDoctor')}
                </Link>
              </Button>
            </div>
            <dl className="anim-fade-up grid grid-cols-2 gap-4 pt-4 lg:grid-cols-4" style={{ animationDelay: '400ms' }}>
              {[
                ['10k+', 'landing.statFamilies'],
                ['50+', 'landing.statSpecialties'],
                ['24/7', 'landing.statTriage'],
                ['3', 'landing.statLangs'],
              ].map(([value, key]) => (
                <div key={key}>
                  <dt className="text-2xl font-bold text-primary">{value}</dt>
                  <dd className="text-xs text-muted-foreground">{t(key)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex justify-center">
            <ChatDemo />
          </div>
        </section>

        {/* features */}
        <section id="features" className="border-y border-primary/10 bg-gradient-to-b from-sky-50/60 via-background to-background py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-balance sm:text-4xl">{t('landing.featuresTitle')}</h2>
              <p className="mt-3 text-muted-foreground">{t('landing.featuresSubtitle')}</p>
            </div>
            <div className="grid gap-10 md:grid-cols-2 md:gap-6">
              <div>
                <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  {t('landing.clinical')}
                </p>
                <div className="grid gap-1">
                  {CLINICAL.map((f, i) => (
                    <FeatureRow key={f.titleKey} feature={f} delay={i * 100} />
                  ))}
                </div>
              </div>
              <div className="md:border-l md:border-primary/10 md:pl-6">
                <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  {t('landing.operations')}
                </p>
                <div className="grid gap-1">
                  {OPERATIONS.map((f, i) => (
                    <FeatureRow key={f.titleKey} feature={f} delay={i * 100} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* two sides */}
        <section id="doctors" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-balance sm:text-4xl">{t('landing.twoSidesTitle')}</h2>
            <p className="mt-3 text-muted-foreground">{t('landing.twoSidesSubtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 to-transparent transition-shadow hover:shadow-xl hover:shadow-primary/10">
              <CardContent className="grid gap-4 p-7">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Baby className="size-6" />
                </div>
                <h3 className="text-xl font-bold">{t('landing.parentsTitle')}</h3>
                <ul className="grid gap-2.5 text-sm">
                  {['landing.parentsB1', 'landing.parentsB2', 'landing.parentsB3', 'landing.parentsB4'].map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {t(key)}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-2 w-fit rounded-full">
                  <Link to="/auth/register">
                    {t('landing.parentsCta')} <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-accent-foreground/20 bg-gradient-to-br from-accent to-transparent transition-shadow hover:shadow-xl hover:shadow-accent-foreground/10">
              <CardContent className="grid gap-4 p-7">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-accent-foreground text-white">
                  <Stethoscope className="size-6" />
                </div>
                <h3 className="text-xl font-bold">{t('landing.doctorsTitle')}</h3>
                <ul className="grid gap-2.5 text-sm">
                  {['landing.doctorsB1', 'landing.doctorsB2', 'landing.doctorsB3', 'landing.doctorsB4'].map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent-foreground" /> {t(key)}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-2 w-fit rounded-full border-accent-foreground/40 text-accent-foreground hover:bg-accent">
                  <Link to="/auth/register">
                    {t('landing.doctorsCta')} <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* how it works */}
        <section id="how" className="border-t border-primary/10 bg-gradient-to-b from-background to-sky-50/60 py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-balance sm:text-4xl">{t('landing.howTitle')}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: MessageCircle, title: 'landing.how1T', desc: 'landing.how1D' },
                { icon: ShieldCheck, title: 'landing.how2T', desc: 'landing.how2D' },
                { icon: CalendarCheck, title: 'landing.how3T', desc: 'landing.how3D' },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="relative grid justify-items-center gap-3 rounded-3xl bg-white/70 p-8 text-center shadow-sm">
                  <span className="absolute top-4 left-5 text-4xl font-bold text-primary/15">{i + 1}</span>
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-7" />
                  </div>
                  <h3 className="font-bold">{t(title)}</h3>
                  <p className="text-sm text-muted-foreground">{t(desc)}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button size="lg" asChild className="rounded-full shadow-lg shadow-primary/25">
                <Link to={session ? dashboardPath : '/auth/register'}>
                  {t('landing.getStarted')} <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="relative z-10 border-t border-primary/10 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Baby className="size-5" /> {t('common.appName')}
          </div>
          <p className="max-w-md text-xs text-muted-foreground">{t('landing.footerDisclaimer')}</p>
          <p className="text-xs text-muted-foreground">© 2026 PediCare AI. {t('landing.footerRights')}</p>
        </div>
      </footer>
    </div>
  )
}
