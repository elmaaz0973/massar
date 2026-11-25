// كل رسائل التشجيع في مكان واحد: عدّل أو أضف عبارات كما تشاء.
const pick = (list, last) => {
  const pool = list.length > 1 ? list.filter((m) => m.t !== last) : list;
  return pool[Math.floor(Math.random() * pool.length)];
};

const CORRECT = [
  { e: '🔥', t: 'عاش يا وحش!' },
  { e: '👏', t: 'إجابتك صح يا بطل!' },
  { e: '🎯', t: 'ضربة معلم!' },
  { e: '💪', t: 'ركّز ركّز.. كمّل كده' },
  { e: '🧠', t: 'دماغك شغّالة جامد' },
  { e: '⭐', t: 'تحفة! إجابة صح' },
  { e: '🚀', t: 'ولا غلطة.. أسطورة!' },
  { e: '😎', t: 'ده انت فاهمها على الآخر' },
];

const WRONG = [
  { e: '💙', t: 'معلش يا بطل، الغلطة بتعلّم' },
  { e: '🤏', t: 'قريبة! اقرا الشرح وهتمسكها' },
  { e: '🌱', t: 'ولا يهمك، الوحش بيغلط الأول وبعدين يمسكها' },
  { e: '📘', t: 'مش مشكلة، المهم تفهمها دلوقتي' },
  { e: '💡', t: 'خد بالك من الشرح وهتجيبها المرة الجاية' },
];

// رسائل التتابع: عدد الإجابات الصحيحة ورا بعض
const COMBO = {
  3: { e: '🔥', t: '٣ ورا بعض! أنت ولّعتها' },
  5: { e: '⚡', t: '٥ ورا بعض.. محدش واقفلك' },
  7: { e: '🦁', t: '٧ ورا بعض! ده انت وحش بجد' },
  10: { e: '👑', t: '١٠ ورا بعض؟ ده انت مش طبيعي' },
};

const ESSAY = {
  good: { e: '🏆', t: 'ممتاز! كده إجابتك كاملة' },
  part: { e: '👍', t: 'حلو! كمّل التفاصيل الناقصة' },
  miss: { e: '📚', t: 'راجع الإجابة النموذجية وهتمسكها المرة الجاية' },
};

export const messageFor = (correct, combo, last) => (correct ? COMBO[combo] || pick(CORRECT, last) : pick(WRONG, last));
export const essayMessage = (rating) => ESSAY[rating];

export function finishMessage(percent) {
  if (percent >= 90) return { e: '🏆', t: 'أسطورة! أنت جاهز للامتحان', s: 'نتيجة مبهرة، كمّل بنفس المستوى.' };
  if (percent >= 70) return { e: '🔥', t: 'شغل جامد يا وحش!', s: 'شوية تثبيت وتوصل لـ 100%.' };
  if (percent >= 50) return { e: '💪', t: 'بداية حلوة يا بطل', s: 'راجع أخطاءك وحاول تاني، هتفرق معاك.' };
  return { e: '🌱', t: 'ولا يهمك، كل بطل بدأ كده', s: 'ارجع للدرس واقرا الشرح وحاول تاني، أنا واثق فيك.' };
}

// الألقاب حسب النقاط (10 نقاط لكل إجابة صحيحة)
const RANKS = [
  { min: 0, title: 'مبتدئ', e: '🌱' },
  { min: 40, title: 'متحمّس', e: '⚡' },
  { min: 100, title: 'محترف', e: '🎯' },
  { min: 200, title: 'وحش المعلومات', e: '🦁' },
  { min: 350, title: 'أسطورة', e: '👑' },
];

export function rankOf(xp = 0) {
  let i = 0;
  RANKS.forEach((r, idx) => { if (xp >= r.min) i = idx; });
  const cur = RANKS[i], next = RANKS[i + 1] || null;
  const progress = next ? Math.round(((xp - cur.min) / (next.min - cur.min)) * 100) : 100;
  return { ...cur, next, progress, toNext: next ? next.min - xp : 0 };
}

// "فاضل كذا": صيغة العدد بالعربية + رسائل التشجيع حسب المتبقي
export const qCount = (n) => (n === 1 ? 'سؤال واحد' : n === 2 ? 'سؤالين' : n <= 10 ? `${n} أسئلة` : `${n} سؤال`);

export function leftMessage(left, total, correct) {
  if (left <= 0) return 'ده آخر سؤال! خلّصه يا بطل وشوف نتيجتك 🏁';
  if (left === 1) return 'فاضل سؤال واحد بس! خلّصها يا وحش 🔥';
  if (left === Math.floor(total / 2) && total >= 6) return `عدّيت نص الطريق يا وحش! فاضل ${qCount(left)} 💪`;
  if (left <= 3) return `فاضل ${qCount(left)} بس، كمّل يا بطل!`;
  return correct ? `كمّل يا وحش، فاضل ${qCount(left)}` : `كمّل يا بطل، فاضل ${qCount(left)} وتعوّضها`;
}
