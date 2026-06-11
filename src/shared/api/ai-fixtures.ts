import type {
  AiForm,
  BillingVisit,
  CanvasDifferential,
  ClinicTask,
  CommThread,
  EvidentiaQuestion,
  IntakeForm,
  ReceptionCall,
  ScribeLine,
  SoapNote,
} from './ai-types'

export const RECEPTION_CALLS: ReceptionCall[] = [
  {
    id: 'rc1', caller: 'Madina Yusupova', phone: '+998 90 123 45 67', time: '2026-06-11T08:42', intent: 'Book a sick visit — fever', outcome: 'booked', durationSec: 96,
    transcript: [
      'AI: PediCare clinic, how can I help you today?',
      'Caller: My son has a fever since last night, can we come in today?',
      'AI: Of course. Dr. Karimova has 11:30 free today — does that work?',
      'Caller: Yes, perfect.',
      'AI: Booked for 11:30 with Dr. Karimova. You will get an SMS confirmation.',
    ],
  },
  {
    id: 'rc2', caller: 'Bekzod Tashkentov', phone: '+998 93 555 11 22', time: '2026-06-11T07:58', intent: 'Vaccine certificate question', outcome: 'info', durationSec: 64,
    transcript: [
      'AI: PediCare clinic, how can I help?',
      'Caller: I need a vaccine certificate for kindergarten.',
      'AI: You can download it from the Vaccines page in the app, or I can email it. Which do you prefer?',
      'Caller: Email please.',
      'AI: Sent to your address on file. Anything else?',
    ],
  },
  {
    id: 'rc3', caller: 'Nargiza Alimova', phone: '+998 97 777 88 99', time: '2026-06-11T06:15', intent: 'Baby breathing fast — urgent', outcome: 'routed', durationSec: 142,
    transcript: [
      'AI: PediCare clinic, how can I help?',
      'Caller: My baby is breathing very fast and won\'t feed.',
      'AI: That needs a doctor right now. I am connecting you to the on-call pediatrician — please stay on the line.',
      'AI: Connected to Dr. Sokolova. Transferring now.',
    ],
  },
  {
    id: 'rc4', caller: 'Unknown', phone: '+998 71 200 00 00', time: '2026-06-10T23:05', intent: 'After-hours reschedule', outcome: 'voicemail', durationSec: 38,
    transcript: [
      'AI: PediCare clinic. Our schedule team will call you back in the morning.',
      'Caller: I want to move Friday\'s appointment to Monday. Same time if possible.',
      'AI: Noted. You will receive a call before 9:00 to confirm.',
    ],
  },
  {
    id: 'rc5', caller: 'Olim Karimov', phone: '+998 99 444 22 11', time: '2026-06-11T09:20', intent: 'Book a routine check-up', outcome: 'booked', durationSec: 81,
    transcript: [
      'AI: PediCare clinic, how can I help?',
      'Caller: A routine check-up for my daughter, sometime this week.',
      'AI: Dr. Olimov has Thursday 13:00 available.',
      'Caller: Works for us.',
      'AI: Booked. See you Thursday!',
    ],
  },
]

export const BILLING_VISITS: BillingVisit[] = [
  {
    id: 'bv1', patient: 'Malika', age: '2y 4m', date: '2026-06-11', summary: 'High fever 39.4°C for 2 days, poor fluid intake, drowsiness. Examined, rapid strep negative, urine dip normal.',
    emLevel: '99214 — Moderate MDM', emReasoning: 'Acute illness with systemic symptoms; data review (2 tests) and moderate risk justify level 4 established-patient visit.',
    total: '$148.00',
    codes: [
      { code: 'R50.9', label: 'Fever, unspecified', confidence: 0.97, kind: 'icd' },
      { code: 'E86.0', label: 'Dehydration', confidence: 0.84, kind: 'icd' },
      { code: 'R40.0', label: 'Somnolence', confidence: 0.71, kind: 'icd' },
      { code: '87880', label: 'Rapid strep test', confidence: 0.99, kind: 'cpt' },
      { code: '81002', label: 'Urinalysis, non-automated', confidence: 0.95, kind: 'cpt' },
    ],
  },
  {
    id: 'bv2', patient: 'Otabek', age: '5y 1m', date: '2026-06-11', summary: 'Dry night cough 5 days, no fever, lungs clear, mild post-nasal drip. Saline rinse and humidifier advised.',
    emLevel: '99213 — Low MDM', emReasoning: 'Single stable acute problem, minimal data, low risk management — level 3 established-patient visit.',
    total: '$96.00',
    codes: [
      { code: 'R05.3', label: 'Chronic cough', confidence: 0.91, kind: 'icd' },
      { code: 'J30.9', label: 'Allergic rhinitis, unspecified', confidence: 0.66, kind: 'icd' },
    ],
  },
  {
    id: 'bv3', patient: 'Sofia', age: '8m', date: '2026-06-10', summary: 'Facial rash after formula change. No respiratory involvement. Suspected cow-milk protein sensitivity; hydrolyzed formula trial.',
    emLevel: '99213 — Low MDM', emReasoning: 'New mild problem with clear management plan and low risk; counseling documented.',
    total: '$102.00',
    codes: [
      { code: 'L27.2', label: 'Dermatitis due to ingested food', confidence: 0.88, kind: 'icd' },
      { code: 'Z71.3', label: 'Dietary counseling', confidence: 0.93, kind: 'cpt' },
    ],
  },
]

export const EVIDENTIA_QUESTIONS: EvidentiaQuestion[] = [
  {
    id: 'ev1',
    question: 'First-line management of acute otitis media in a 3-year-old with mild symptoms?',
    judgeRationale: 'Answer B cited current AAP watchful-waiting criteria precisely, including the 48–72h safety-net antibiotic plan and age/severity thresholds. A was correct but omitted follow-up timing; C overstated antibiotic urgency; D lacked dosing.',
    answers: [
      { model: 'Atlas-4', latencyMs: 2300, rank: 2, score: 8.7, text: 'Observation without antibiotics is appropriate for mild unilateral AOM at this age. Treat pain with weight-dosed ibuprofen. If symptoms persist beyond 48–72 hours, start amoxicillin 80–90 mg/kg/day.' },
      { model: 'Borealis-XL', latencyMs: 3100, rank: 1, score: 9.4, text: 'Per AAP guidance: for a 3-year-old with mild, non-severe unilateral AOM (T < 39°C, mild otalgia < 48h), offer watchful waiting with analgesia and a safety-net antibiotic prescription. Re-assess at 48–72h; escalate to amoxicillin 90 mg/kg/day divided BID if not improving. Severe or bilateral disease → treat immediately.' },
      { model: 'Cygnus-Med', latencyMs: 1900, rank: 3, score: 7.2, text: 'Begin amoxicillin promptly to avoid complications; AOM in toddlers can progress. Analgesia with paracetamol. Recheck the ear in one week.' },
      { model: 'Delphi-2', latencyMs: 2700, rank: 4, score: 6.1, text: 'Antibiotics are the mainstay for AOM. Amoxicillin is first-line unless allergic. Decongestants may help drainage.' },
    ],
  },
  {
    id: 'ev2',
    question: 'When does a febrile infant under 3 months require a full sepsis workup?',
    judgeRationale: 'Answer A gave the precise age-stratified pathway (≤28 days: full workup + empiric antibiotics; 29–60 days: risk-stratify with inflammatory markers) matching 2021 AAP febrile-infant guidelines. Others were directionally right but less complete.',
    answers: [
      { model: 'Atlas-4', latencyMs: 2500, rank: 1, score: 9.1, text: 'Any rectal temp ≥ 38.0°C in an infant ≤ 28 days: full evaluation (blood, urine, CSF cultures) + empiric antibiotics + admission. 29–60 days: urinalysis, blood culture, inflammatory markers (procalcitonin, ANC, CRP); lumbar puncture and admission if markers abnormal. Ill appearance at any age → full workup.' },
      { model: 'Borealis-XL', latencyMs: 2900, rank: 2, score: 8.5, text: 'Neonates ≤ 28 days with fever ≥ 38°C need the complete septic workup and empiric antibiotics regardless of appearance. Older well-appearing infants (1–2 months) can be risk-stratified using labs before deciding on LP.' },
      { model: 'Cygnus-Med', latencyMs: 2000, rank: 3, score: 7.6, text: 'Under 1 month: always full sepsis workup. 1–3 months: depends on appearance and labs. When in doubt, admit for observation.' },
      { model: 'Delphi-2', latencyMs: 3300, rank: 4, score: 6.8, text: 'Febrile infants under 3 months are high risk; most should get blood and urine testing, and many need lumbar puncture. Clinical judgment guides the rest.' },
    ],
  },
]

export const INTAKE_FORMS: IntakeForm[] = [
  {
    id: 'if1', child: 'Malika', age: '2y 4m', visitReason: 'High fever, urgent consult', status: 'completed',
    qa: [
      { q: 'How high has the temperature been?', a: '39.4°C at its highest, since Tuesday', flag: true },
      { q: 'Is your child drinking fluids?', a: 'Refuses almost everything since this morning', flag: true },
      { q: 'Energy level?', a: 'Very sleepy, hard to wake for feeds', flag: true },
      { q: 'Any rash?', a: 'No rash' },
      { q: 'Current medications?', a: 'Paracetamol syrup 3x today' },
      { q: 'Allergies?', a: 'None known' },
    ],
    summary: '2-year-old with 2 days of high fever (max 39.4°C), refusing fluids and unusually drowsy — three red flags consistent with possible serious bacterial infection or dehydration. Already received paracetamol x3 today. No rash, no known allergies. Recommend immediate assessment, hydration status check and septic screen if exam confirms lethargy.',
  },
  {
    id: 'if2', child: 'Otabek', age: '5y 1m', visitReason: 'Night cough 5 days', status: 'completed',
    qa: [
      { q: 'When does the cough happen?', a: 'Mostly at night, sometimes after running' },
      { q: 'Any fever?', a: 'No fever' },
      { q: 'Wheezing or hard breathing?', a: 'No' },
      { q: 'Family history of asthma or allergies?', a: 'Father has hay fever', flag: true },
      { q: 'Pets or new exposures at home?', a: 'New cat 3 weeks ago', flag: true },
    ],
    summary: '5-year-old with 5 days of dry night/exercise cough, afebrile, no distress. Atopic family history plus a new cat exposure raise suspicion of allergic or early reactive-airway etiology. Consider exam for wheeze, trial of antihistamine, discuss allergen exposure.',
  },
  {
    id: 'if3', child: 'Amir', age: '3y 7m', visitReason: 'Routine check-up', status: 'pending',
    qa: [],
    summary: '',
  },
]

export const COMM_THREADS: CommThread[] = [
  {
    id: 'ct1', channel: 'sms', from: 'Madina Yusupova', subject: 'Re: appointment today 11:30', time: '2026-06-11T09:02', unread: true, handled: false,
    messages: [
      { author: 'clinic', text: 'Reminder: Alisher is booked today 11:30 with Dr. Karimova.', at: '2026-06-11T08:45' },
      { author: 'them', text: 'We are stuck in traffic, can we come 15 minutes late?', at: '2026-06-11T09:02' },
    ],
    aiDraft: 'Of course — Dr. Karimova can see Alisher at 11:45 instead. Your slot is updated; please check in at reception when you arrive.',
  },
  {
    id: 'ct2', channel: 'email', from: 'kindergarten45@edu.uz', subject: 'Vaccination certificate request — Otabek', time: '2026-06-11T08:10', unread: true, handled: false,
    messages: [
      { author: 'them', text: 'Dear clinic, please send the vaccination certificate for Otabek (group 4) for our records before June 15.', at: '2026-06-11T08:10' },
    ],
    aiDraft: 'Hello! Attached is Otabek\'s up-to-date vaccination certificate (BCG, HepB, DTP series, MMR — all current). Signed copy follows by post if required. Best regards, PediCare Clinic.',
  },
  {
    id: 'ct3', channel: 'fax', from: 'City Lab Diagnostics', subject: 'Lab results — patient Sofia', time: '2026-06-10T17:34', unread: false, handled: false,
    messages: [
      { author: 'them', text: 'FAX 2 pages: IgE panel results for patient Sofia, 8m. Elevated casein-specific IgE. Full table attached.', at: '2026-06-10T17:34' },
    ],
    aiDraft: 'Results received and filed to Sofia\'s chart. Casein-specific IgE elevation supports the suspected cow-milk protein allergy — flagged for Dr. Rashidov\'s review and parent callback today.',
  },
  {
    id: 'ct4', channel: 'phone', from: 'Nargiza Alimova', subject: 'Voicemail — follow-up after ER referral', time: '2026-06-11T07:50', unread: false, handled: true,
    messages: [
      { author: 'them', text: 'Voicemail transcript: Thank you for connecting us to the doctor this morning, baby is okay. The hospital asked for the referral note to be emailed.', at: '2026-06-11T07:50' },
    ],
    aiDraft: 'So glad to hear the baby is doing better! The referral note has been emailed to the hospital and a copy sent to you. Call us anytime.',
  },
]

export const INITIAL_TASKS: ClinicTask[] = [
  { id: 'tk1', title: 'Call Malika\'s parents — recheck fever and fluid intake', assignee: 'Nurse Zarina', priority: 'high', due: '2026-06-11', status: 'todo' },
  { id: 'tk2', title: 'Review City Lab IgE panel for Sofia', assignee: 'Dr. Rashidov', priority: 'high', due: '2026-06-11', status: 'todo' },
  { id: 'tk3', title: 'Send vaccination certificate to kindergarten #45', assignee: 'Front desk', priority: 'medium', due: '2026-06-12', status: 'inProgress' },
  { id: 'tk4', title: 'Restock rapid strep tests (below 20 units)', assignee: 'Nurse Zarina', priority: 'medium', due: '2026-06-13', status: 'inProgress' },
  { id: 'tk5', title: 'Upload June vaccine fridge temperature log', assignee: 'Front desk', priority: 'low', due: '2026-06-10', status: 'done' },
]

export const AI_FORMS: AiForm[] = [
  {
    id: 'af1', name: 'School sports participation form', pages: 2, source: 'school_sports_2026.pdf',
    fields: [
      { label: 'Child full name', value: 'Otabek Tashkentov', fromContext: true },
      { label: 'Date of birth', value: '2021-05-03', fromContext: true },
      { label: 'Known allergies', value: 'None', fromContext: true },
      { label: 'Last physical exam', value: '2026-05-20', fromContext: true },
      { label: 'Cleared for sports', value: 'Yes — no restrictions', fromContext: false },
      { label: 'Physician name & license', value: 'Dr. Jasur Olimov, #PD-4821', fromContext: true },
    ],
  },
  {
    id: 'af2', name: 'Insurance pre-authorization', pages: 3, source: 'uzmed_preauth_v4.pdf',
    fields: [
      { label: 'Patient', value: 'Malika Yusupova', fromContext: true },
      { label: 'Policy number', value: 'UZM-449-220', fromContext: true },
      { label: 'Diagnosis (ICD-10)', value: 'R50.9 — Fever, unspecified', fromContext: true },
      { label: 'Requested service', value: 'Urgent pediatric consultation', fromContext: true },
      { label: 'Justification', value: 'Persistent fever 2 days with dehydration risk', fromContext: false },
    ],
  },
  {
    id: 'af3', name: 'Daycare medication authorization', pages: 1, source: 'daycare_med_auth.pdf',
    fields: [
      { label: 'Child', value: 'Sofia Alimova', fromContext: true },
      { label: 'Medication', value: 'Hydrolyzed formula (Nutramigen)', fromContext: true },
      { label: 'Schedule', value: 'Every feed', fromContext: false },
      { label: 'Prescriber', value: 'Dr. Timur Rashidov', fromContext: true },
    ],
  },
]

export const SCRIBE_SCRIPT: ScribeLine[] = [
  { speaker: 'doctor', text: 'Good morning! So this is Otabek, five years old, here for the cough. Tell me about it.' },
  { speaker: 'parent', text: 'It started about five days ago. He coughs mostly at night, dry cough, no phlegm.' },
  { speaker: 'doctor', text: 'Any fever at home? Wheezing, fast breathing?' },
  { speaker: 'parent', text: 'No fever. Breathing seems normal, he plays as usual during the day.' },
  { speaker: 'doctor', text: 'Okay. Chest is clear on both sides, no wheeze, throat mildly red, some post-nasal drip. Ears look fine.' },
  { speaker: 'doctor', text: 'I think this is a post-viral cough with post-nasal drip. We will do saline nose rinses and a humidifier at night.' },
  { speaker: 'parent', text: 'Do we need antibiotics?' },
  { speaker: 'doctor', text: 'No antibiotics — it is not bacterial. If the cough lasts beyond two more weeks or he develops fever or wheeze, come back and we will reassess.' },
]

export const SCRIBE_SOAP: SoapNote = {
  s: '5-year-old male with 5 days of dry, predominantly nocturnal cough. No fever, no wheeze reported, normal daytime activity. No phlegm. Parent denies dyspnea.',
  o: 'Lungs clear bilaterally, no wheeze or retractions. Oropharynx mildly erythematous with post-nasal drip. Tympanic membranes normal. Afebrile in clinic.',
  a: 'Post-viral cough with post-nasal drip. Low suspicion for bacterial infection or reactive airway disease at this time.',
  p: 'Saline nasal rinses BID, bedroom humidifier at night. No antibiotics. Return precautions: cough > 2 additional weeks, new fever, wheeze or labored breathing → reassess; consider allergy evaluation given new cat exposure.',
}

export const CANVAS_DIFFERENTIALS: Record<string, CanvasDifferential[]> = {
  c1: [
    { dx: 'Serious bacterial infection (UTI / bacteremia)', likelihood: 0.45, supports: 'Fever 39.4°C > 48h, drowsiness, poor intake', against: 'No localizing signs reported yet' },
    { dx: 'Viral syndrome with dehydration', likelihood: 0.35, supports: 'Season, gradual onset, age', against: 'Marked lethargy unusual' },
    { dx: 'Meningitis', likelihood: 0.12, supports: 'Drowsiness + high fever', against: 'No reported neck stiffness, rash or vomiting' },
    { dx: 'Acute otitis media', likelihood: 0.08, supports: 'Common at this age with fever', against: 'No ear pulling or pain reported' },
  ],
  c2: [
    { dx: 'Post-viral cough', likelihood: 0.5, supports: '5-day dry cough, afebrile, well-appearing', against: 'No preceding URI reported' },
    { dx: 'Allergic rhinitis / postnasal drip', likelihood: 0.3, supports: 'Night-time pattern, atopic family history, new cat', against: 'No sneezing or itchy eyes' },
    { dx: 'Cough-variant asthma', likelihood: 0.15, supports: 'Nocturnal + exertional cough', against: 'No wheeze on exam' },
    { dx: 'Pertussis', likelihood: 0.05, supports: 'Prolonged cough', against: 'Vaccinated, no paroxysms or whoop' },
  ],
  c3: [
    { dx: 'Cow-milk protein allergy', likelihood: 0.55, supports: 'Rash onset after formula change, elevated casein IgE', against: 'Limited to face so far' },
    { dx: 'Atopic dermatitis flare', likelihood: 0.3, supports: 'Age-typical cheek distribution', against: 'Tight temporal link to formula' },
    { dx: 'Contact dermatitis', likelihood: 0.15, supports: 'Localized facial rash', against: 'No new topical products' },
  ],
  c4: [
    { dx: 'Viral gastroenteritis', likelihood: 0.7, supports: 'Single loose stool, well-hydrated, no fever', against: '—' },
    { dx: 'Dietary indiscretion', likelihood: 0.25, supports: 'Isolated episode', against: 'No unusual foods reported' },
    { dx: 'Early bacterial enteritis', likelihood: 0.05, supports: 'Loose stool', against: 'No blood, no fever, single episode' },
  ],
}
