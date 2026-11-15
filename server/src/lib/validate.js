const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v) => (typeof v === 'string' ? v.trim() : '');

export function validateRegistration(body = {}) {
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (name.length < 2 || name.length > 60) return { error: 'الاسم يجب أن يكون بين 2 و60 حرفاً' };
  if (email.length > 254 || !EMAIL_RE.test(email)) return { error: 'البريد الإلكتروني غير صالح' };
  // bcrypt يقرأ أول 72 بايت فقط
  if (password.length < 8 || Buffer.byteLength(password) > 72) return { error: 'كلمة المرور يجب ألا تقل عن 8 أحرف (وبحد أقصى 72 بايت)' };
  return { value: { name, email, password } };
}

export function validateQuiz(questions) {
  if (!Array.isArray(questions) || questions.length < 1 || questions.length > 30) {
    return { error: 'عدد الأسئلة يجب أن يكون بين 1 و30' };
  }
  const clean = [];
  for (const [i, q] of questions.entries()) {
    const n = i + 1;
    const prompt = str(q?.prompt);
    if (!prompt || prompt.length > 500) return { error: `السؤال ${n}: نص السؤال مطلوب (حتى 500 حرف)` };
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) return { error: `السؤال ${n}: يجب أن يكون له من 2 إلى 6 خيارات` };
    const options = q.options.map(str);
    if (options.some((o) => !o || o.length > 300)) return { error: `السؤال ${n}: كل خيار مطلوب (حتى 300 حرف)` };
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= options.length) {
      return { error: `السؤال ${n}: الإجابة الصحيحة غير صالحة` };
    }
    const explanation = str(q.explanation);
    if (explanation.length > 1000) return { error: `السؤال ${n}: الشرح طويل جداً` };
    const source = str(q.source);
    if (source.length > 100) return { error: `السؤال ${n}: المرجع طويل جداً` };
    clean.push({ prompt, options, correctIndex: q.correctIndex, explanation, source });
  }
  return { value: clean };
}
