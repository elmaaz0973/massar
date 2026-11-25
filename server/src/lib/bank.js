// إعدادات بنك الأسئلة وأدوات التصحيح (الخادم فقط)
export const BANK = {
  PRODUCT: 'bank:g1:t1:paid',   // منتج واحد يفتح الوحدات المدفوعة
  FREE_UNITS: [1],              // الوحدة الأولى مجانية (معاينة)
  UNITS: [
    { number: 1, title: 'ما هي المعلومات؟', lessons: [{ slug: 'lesson-1-1', title: 'المعلومات والوسائط' }, { slug: 'lesson-1-2', title: 'أخلاقيات المعلومات' }] },
    { number: 2, title: 'القوانين والحقوق في مجتمع المعلومات', lessons: [{ slug: 'lesson-2-1', title: 'البيانات الشخصية' }, { slug: 'lesson-2-2', title: 'حقوق الملكية الفكرية' }, { slug: 'lesson-2-3', title: 'استخدام المعلومات والكشف عنها' }] },
    { number: 3, title: 'أمن المعلومات', lessons: [{ slug: 'lesson-3-1', title: 'تهديدات وإجراءات مواجهة أمن المعلومات (1)' }, { slug: 'lesson-3-2', title: 'التهديدات والتدابير المضادة في أمن المعلومات (2)' }, { slug: 'lesson-3-3', title: 'التهديدات والتدابير المضادة في أمن المعلومات (3)' }, { slug: 'lesson-3-4', title: 'تقنيات المعلومات للسلامة (1)' }, { slug: 'lesson-3-5', title: 'تقنيات المعلومات للسلامة (2)' }] },
    { number: 4, title: 'تكنولوجيا المعلومات والمجتمع', lessons: [{ slug: 'lesson-4-1', title: 'تطور تكنولوجيا المعلومات' }] },
    { number: 5, title: 'الاتصالات', lessons: [{ slug: 'lesson-5-1', title: 'تطوير وسائل الاتصال' }, { slug: 'lesson-5-2', title: 'الاتصال وأشكاله' }, { slug: 'lesson-5-3', title: 'الإنترنت والاتصالات' }] },
    { number: 6, title: 'تصميم المعلومات', lessons: [{ slug: 'lesson-6-1', title: 'التناظري والرقمي' }, { slug: 'lesson-6-2', title: 'النظام الثنائي وكمية البيانات' }, { slug: 'lesson-6-3', title: 'النظام السادس عشر (Hexadecimal)' }, { slug: 'lesson-6-4', title: 'التمثيل الرقمي للأحرف' }, { slug: 'lesson-6-5', title: 'العمليات الحسابية العددية (1)' }, { slug: 'lesson-6-6', title: 'العمليات الحسابية العددية (2)' }, { slug: 'lesson-6-7', title: 'رقمنة الصوت' }, { slug: 'lesson-6-8', title: 'رقمنة الصور' }, { slug: 'lesson-6-9', title: 'التمثيل الرقمي وضغط الفيديو' }, { slug: 'lesson-6-10', title: 'تصميم البيانات' }] },
    { number: 7, title: 'الكمبيوترات', lessons: [{ slug: 'lesson-7-1', title: 'بنية الكمبيوتر' }, { slug: 'lesson-7-2', title: 'برامج الكمبيوتر' }, { slug: 'lesson-7-3', title: 'الدوائر المنطقية' }] },
  ],
};

export const bankPrice = () => Number(process.env.BANK_PRICE) || 100;   // الافتراضي 100 جنيه، ويمكن تغييره من BANK_PRICE
// الدفع مفتوح افتراضياً (كل الوحدات اكتملت وراجعها المدرّس). لإيقافه مؤقتاً: BANK_SALES_OPEN=false
export const salesOpen = () => process.env.BANK_SALES_OPEN !== 'false';
// رقم محفظة الاستلام وهو نفسه رقم إنستاباي. يمكن تغييره من المتغير BANK_INSTAPAY_ACCOUNT دون تعديل الكود.
export const DEFAULT_PAY_ACCOUNT = '01026924833';
export const payAccount = () => process.env.BANK_INSTAPAY_ACCOUNT || DEFAULT_PAY_ACCOUNT;
export const isFreeUnit = (n) => BANK.FREE_UNITS.includes(n);

// هل الدرس تابع لهذه الوحدة؟ (للتحقق من فلتر الأجزاء)
export const lessonOfUnit = (unit, slug) => BANK.UNITS.find((u) => u.number === unit)?.lessons.some((l) => l.slug === slug) ?? false;

export function unitNumber(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= BANK.UNITS.length ? n : null;
}

// choice: رقم الخيار. يرجع نتيجة سؤال موضوعي واحد.
export function gradeChoice(q, choice) {
  const valid = Number.isInteger(choice) && choice >= 0 && choice < q.options.length;
  const correct = valid && choice === q.correctIndex;
  return { correct, correctIndex: q.correctIndex, explanation: q.explanation || '', source: q.source || '' };
}

const cairoDay = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(d); // YYYY-MM-DD

// عدد الأيام المتتالية التي حلّ فيها الطالب (بتوقيت القاهرة). يستمر إن حلّ اليوم أو أمس.
export function streakDays(dates, now = new Date()) {
  const days = new Set(dates.map((d) => cairoDay(new Date(d))));
  const step = (from, back) => cairoDay(new Date(from.getTime() - back * 86400000));
  let start = days.has(step(now, 0)) ? 0 : days.has(step(now, 1)) ? 1 : -1;
  if (start < 0) return 0;
  let n = 0;
  while (days.has(step(now, start + n))) n++;
  return n;
}

// أفضل نتيجة لكل وحدة، مع دعم حلّ الوحدة كاملة أو جزءاً جزءاً (درساً درساً).
// النقاط: 10 لكل إجابة صحيحة في أفضل محاولة لكل جزء. للوحدة نأخذ الأعلى بين (الوحدة كاملة) و(مجموع أجزائها)
// فلا تُحسب النقاط مرتين ولا يمكن تكرارها بإعادة الحلّ.
export function summarizeAttempts(attempts) {
  const bestPart = {};
  for (const a of attempts) {
    const key = `${a.unit}:${a.lesson || ''}`;
    if (!bestPart[key] || a.percent > bestPart[key].percent) {
      bestPart[key] = { unit: a.unit, lesson: a.lesson || '', correct: a.correct, total: a.total, percent: a.percent };
    }
  }
  const best = {}, lessons = {};
  let xp = 0;
  for (const u of new Set(Object.values(bestPart).map((p) => p.unit))) {
    const whole = bestPart[`${u}:`];
    const parts = Object.values(bestPart).filter((p) => p.unit === u && p.lesson);
    for (const p of parts) lessons[p.lesson] = { correct: p.correct, total: p.total, percent: p.percent };
    const pc = parts.reduce((n, p) => n + p.correct, 0), pt = parts.reduce((n, p) => n + p.total, 0);
    const cands = [whole, pt ? { correct: pc, total: pt, percent: Math.round((pc / pt) * 100) } : null].filter(Boolean);
    const top = cands.sort((x, y) => y.correct - x.correct)[0];
    best[u] = { correct: top.correct, total: top.total, percent: top.percent };
    xp += top.correct * 10;
  }
  return { best, lessons, xp };
}
