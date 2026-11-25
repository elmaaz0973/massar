import { Router } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import BankQuestion from '../models/BankQuestion.js';
import BankAttempt from '../models/BankAttempt.js';
import Payment from '../models/Payment.js';
import Entitlement from '../models/Entitlement.js';
import { authOptional, authRequired, requireAdmin } from '../middleware/auth.js';
import { unitAccess, hasPaidAccess } from '../middleware/bankAccess.js';
import { BANK, bankPrice, salesOpen, payAccount, isFreeUnit, gradeChoice, streakDays, summarizeAttempts, lessonOfUnit } from '../lib/bank.js';

const router = Router();
const tooMany = { message: 'طلبات كثيرة، انتظر قليلاً ثم حاول مرة أخرى' };
// العدّ حسب المستخدم المسجّل (لا حسب الـ IP): شبكات الموبايل في مصر تتشارك IP واحداً بين طلبة كثيرين،
// فالعدّ بالـ IP قد يحجب طالباً بسبب غيره. الزائر على الوحدة المجانية يُعدّ بالـ IP بحدّ أعلى.
const byUser = (req) => (req.user ? `u:${req.user._id}` : req.ip);
const limiter = rateLimit({ windowMs: 60_000, limit: (req) => (req.user ? 120 : 300), keyGenerator: byUser, standardHeaders: true, legacyHeaders: false, message: tooMany });
const payLimiter = rateLimit({ windowMs: 3_600_000, limit: 10, keyGenerator: byUser, standardHeaders: true, legacyHeaders: false, message: tooMany });
const OBJECTIVE = { $in: ['mcq', 'tf'] };

// ---------- القائمة العامة: عناوين الوحدات وأعداد الأسئلة فقط (لا نصوص أسئلة) ----------
router.get('/', authOptional, async (req, res, next) => {
  try {
    const rows = await BankQuestion.aggregate([
      { $match: { unit: { $in: BANK.UNITS.map((u) => u.number) } } },
      { $group: { _id: { unit: '$unit', objective: { $in: ['$type', ['mcq', 'tf']] } }, n: { $sum: 1 } } },
    ]);
    const counts = {};
    for (const r of rows) {
      const c = (counts[r._id.unit] ||= { objective: 0, essay: 0 });
      c[r._id.objective ? 'objective' : 'essay'] += r.n;
    }
    const paid = await hasPaidAccess(req.user?._id);
    const units = BANK.UNITS.map(({ number, title }) => {
      const c = counts[number] || { objective: 0, essay: 0 };
      const questionCount = c.objective + c.essay;
      return { number, title, free: isFreeUnit(number), ready: questionCount > 0, questionCount, objectiveCount: c.objective, essayCount: c.essay, unlocked: isFreeUnit(number) || paid };
    });

    let me = null;
    if (req.user) {
      const attempts = await BankAttempt.find({ user: req.user._id }).sort({ createdAt: 1 }).lean();
      const { best, lessons, xp } = summarizeAttempts(attempts);
      for (const u of units) if (best[u.number]) best[u.number].partial = best[u.number].total < u.objectiveCount;
      const pending = await Payment.exists({ user: req.user._id, status: 'pending' });
      me = { name: req.user.name, xp, best, lessons, streakDays: streakDays(attempts.map((a) => a.createdAt)), pendingPayment: Boolean(pending) };
    }
    res.json({ price: bankPrice(), salesOpen: salesOpen(), paid, units, me });
  } catch (e) { next(e); }
});

// ---------- أسئلة وحدة (بدون أي إجابات) ----------
router.get('/units/:n', unitAccess, async (req, res, next) => {
  try {
    const questions = await BankQuestion.find({ unit: req.unit })
      .select('qid lesson type level prompt options marks')   // قائمة بيضاء: لا correctIndex ولا explanation ولا modelAnswer
      .sort({ order: 1 }).lean();
    if (!questions.length) return res.status(404).json({ message: 'أسئلة هذه الوحدة قيد الإعداد', comingSoon: true });
    const unit = BANK.UNITS.find((u) => u.number === req.unit);
    const lessons = unit.lessons.map((l) => {
      const mine = questions.filter((q) => q.lesson === l.slug);
      return { slug: l.slug, title: l.title, count: mine.length, objectiveCount: mine.filter((q) => q.type !== 'essay').length };
    }).filter((l) => l.count > 0);
    res.json({
      unit: { number: unit.number, title: unit.title },
      lessons,
      questions: questions.map((q) => ({ id: q.qid, lesson: q.lesson, type: q.type, level: q.level, prompt: q.prompt, options: q.options, marks: q.type === 'essay' ? q.marks : undefined })),
    });
  } catch (e) { next(e); }
});

// ---------- تصحيح سؤال واحد فوراً ----------
router.post('/units/:n/check', unitAccess, limiter, async (req, res, next) => {
  try {
    const { id, choice } = req.body || {};
    if (typeof id !== 'string' || !Number.isInteger(choice)) return res.status(400).json({ message: 'بيانات غير صالحة' });
    const q = await BankQuestion.findOne({ qid: id, unit: req.unit, type: OBJECTIVE }).lean();
    if (!q) return res.status(404).json({ message: 'السؤال غير موجود' });
    res.json(gradeChoice(q, choice));
  } catch (e) { next(e); }
});

// ---------- الإجابة النموذجية لسؤال مقالي ----------
router.post('/units/:n/reveal', unitAccess, limiter, async (req, res, next) => {
  try {
    const { id } = req.body || {};
    if (typeof id !== 'string') return res.status(400).json({ message: 'بيانات غير صالحة' });
    const q = await BankQuestion.findOne({ qid: id, unit: req.unit, type: 'essay' }).lean();
    if (!q) return res.status(404).json({ message: 'السؤال غير موجود' });
    res.json({ modelAnswer: q.modelAnswer, marks: q.marks, source: q.source || '' });
  } catch (e) { next(e); }
});

// ---------- إنهاء الوحدة: نعيد حساب النتيجة من الإجابات على الخادم ثم نحفظها للمسجّل ----------
router.post('/units/:n/finish', unitAccess, limiter, async (req, res, next) => {
  try {
    const answers = Array.isArray(req.body?.answers) ? req.body.answers.slice(0, 200) : null;
    if (!answers) return res.status(400).json({ message: 'بيانات غير صالحة' });
    const lesson = typeof req.body?.lesson === 'string' ? req.body.lesson : '';
    if (lesson && !lessonOfUnit(req.unit, lesson)) return res.status(400).json({ message: 'درس غير صالح' });
    const all = await BankQuestion.find({ unit: req.unit, type: OBJECTIVE }).lean();
    const qs = lesson ? all.filter((q) => q.lesson === lesson) : all;
    const chosen = new Map(answers.filter((a) => a && typeof a.id === 'string').map((a) => [a.id, a.choice]));
    const wrongIds = [];
    let correct = 0;
    for (const q of qs) (gradeChoice(q, chosen.get(q.qid)).correct ? correct++ : wrongIds.push(q.qid));
    const total = qs.length;
    const percent = total ? Math.round((correct / total) * 100) : 0;
    let saved = false;
    if (req.user && total) {
      await BankAttempt.create({ user: req.user._id, unit: req.unit, lesson, correct, total, percent });
      saved = true;
    }
    res.json({ correct, total, percent, wrongIds, saved });
  } catch (e) { next(e); }
});

// ---------- الدفع (إنستاباي يدوي) ----------
router.get('/pay-info', (_req, res) => {
  res.json({ price: bankPrice(), salesOpen: salesOpen(), method: 'instapay', account: payAccount(), accountName: process.env.BANK_INSTAPAY_NAME || '' });
});

router.post('/payments', authRequired, payLimiter, async (req, res, next) => {
  try {
    if (!salesOpen()) return res.status(403).json({ message: 'الاشتراك لم يُفتح بعد، ترقّب الإعلان قريباً' });
    const reference = String(req.body?.reference || '').trim().toUpperCase();
    const payerName = String(req.body?.payerName || '').trim();
    const payerPhone = String(req.body?.payerPhone || '').trim();
    if (!/^[A-Z0-9_-]{6,40}$/.test(reference)) return res.status(400).json({ message: 'رقم العملية غير صالح (6 إلى 40 حرفاً أو رقماً)' });
    if (payerName.length < 2 || payerName.length > 60) return res.status(400).json({ message: 'اكتب اسم صاحب التحويل' });
    if (payerPhone && !/^\+?\d{8,15}$/.test(payerPhone)) return res.status(400).json({ message: 'رقم الهاتف غير صالح' });
    if (await hasPaidAccess(req.user._id)) return res.status(409).json({ message: 'اشتراكك مفعّل بالفعل' });
    if (await Payment.exists({ user: req.user._id, status: 'pending' })) return res.status(409).json({ message: 'لديك طلب قيد المراجعة بالفعل' });
    try {
      const p = await Payment.create({ user: req.user._id, product: BANK.PRODUCT, amount: bankPrice(), reference, payerName, payerPhone });
      res.status(201).json({ id: String(p._id), status: p.status });
    } catch (e) {
      if (e?.code === 11000) return res.status(409).json({ message: 'رقم العملية هذا مستخدم من قبل' });
      throw e;
    }
  } catch (e) { next(e); }
});

router.get('/payments/mine', authRequired, async (req, res, next) => {
  try {
    const p = await Payment.findOne({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(p ? { status: p.status, reference: p.reference, note: p.note, createdAt: p.createdAt } : null);
  } catch (e) { next(e); }
});

// ---------- الأدمن: مراجعة طلبات الدفع ----------
router.get('/admin/payments', ...requireAdmin, async (req, res, next) => {
  try {
    const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : 'pending';
    const list = await Payment.find({ status }).sort({ createdAt: -1 }).limit(200).populate('user', 'name email').lean();
    res.json(list.map((p) => ({ id: String(p._id), user: p.user ? { name: p.user.name, email: p.user.email } : null, amount: p.amount, reference: p.reference, payerName: p.payerName, payerPhone: p.payerPhone, status: p.status, note: p.note, createdAt: p.createdAt })));
  } catch (e) { next(e); }
});

router.post('/admin/payments/:id/:action', ...requireAdmin, async (req, res, next) => {
  try {
    const { id, action } = req.params;
    if (!mongoose.isValidObjectId(id) || !['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'طلب غير صالح' });
    const p = await Payment.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { status: action === 'approve' ? 'approved' : 'rejected', reviewedBy: req.user._id, reviewedAt: new Date(), note: String(req.body?.note || '').slice(0, 200) },
      { new: true }
    );
    if (!p) return res.status(404).json({ message: 'الطلب غير موجود أو تمت مراجعته' });
    if (action === 'approve') {
      await Entitlement.updateOne({ user: p.user, product: p.product }, { $setOnInsert: { payment: p._id, expiresAt: null } }, { upsert: true });
    }
    res.json({ id: String(p._id), status: p.status });
  } catch (e) { next(e); }
});

export default router;
