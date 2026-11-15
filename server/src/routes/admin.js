import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAdmin } from '../middleware/auth.js';
import Stage from '../models/Stage.js';
import Unit from '../models/Unit.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import { validateQuiz } from '../lib/validate.js';

const router = Router();

router.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: true, legacyHeaders: false }));
router.use(requireAdmin);  // JWT + دور admin

router.get('/check', (_req, res) => res.json({ ok: true }));

// كل الهيكل مع حالة كل درس (بدون المحتوى)
router.get('/lessons', async (_req, res, next) => {
  try {
    const [stages, units, lessons] = await Promise.all([
      Stage.find({ slug: { $in: ['grade-1', 'grade-2'] } }).sort({ order: 1 }).lean(),
      Unit.find().sort({ term: 1, order: 1 }).lean(),
      Lesson.find().sort({ order: 1 }).lean(),
    ]);
    const lessonsByUnit = new Map();
    for (const l of lessons) {
      const item = { _id: l._id, number: l.number, title: l.title, status: l.status, hasContent: l.content.trim().length > 0 };
      const key = String(l.unit);
      if (!lessonsByUnit.has(key)) lessonsByUnit.set(key, []);
      lessonsByUnit.get(key).push(item);
    }
    res.json(
      stages.map((s) => ({
        stage: s,
        units: units.filter((u) => String(u.stage) === String(s._id)).map((u) => ({ ...u, lessons: lessonsByUnit.get(String(u._id)) ?? [] })),
      }))
    );
  } catch (e) { next(e); }
});

router.get('/lessons/:id', async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).lean();
    if (!lesson) return res.status(404).json({ message: 'الدرس غير موجود' });
    const [stage, unit] = await Promise.all([Stage.findById(lesson.stage).lean(), Unit.findById(lesson.unit).lean()]);
    res.json({ lesson, stage, unit });
  } catch (e) { next(e); }
});

router.put('/lessons/:id', async (req, res, next) => {
  try {
    const { title, objectives, content, status, source = '' } = req.body ?? {};

    if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ message: 'العنوان مطلوب' });
    if (!Array.isArray(objectives) || objectives.some((o) => typeof o !== 'string')) {
      return res.status(400).json({ message: 'أهداف التعلم يجب أن تكون قائمة نصوص' });
    }
    if (typeof content !== 'string' || content.length > 200_000) return res.status(400).json({ message: 'المحتوى غير صالح أو طويل جداً' });
    if (typeof source !== 'string' || source.length > 300) return res.status(400).json({ message: 'المرجع غير صالح' });
    if (!['draft', 'published'].includes(status)) return res.status(400).json({ message: 'حالة غير صالحة' });
    if (status === 'published' && !content.trim()) return res.status(400).json({ message: 'لا يمكن نشر درس بدون محتوى' });

    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { title: title.trim(), objectives: objectives.map((o) => o.trim()).filter(Boolean).slice(0, 20), content, status, source: source.trim() },
      { new: true, runValidators: true }
    ).lean();
    if (!lesson) return res.status(404).json({ message: 'الدرس غير موجود' });
    res.json({ lesson });
  } catch (e) { next(e); }
});

// ---------- الكويز ----------
router.get('/lessons/:id/quiz', async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ lesson: req.params.id }).lean();
    res.json({ questions: quiz?.questions ?? [] });
  } catch (e) { next(e); }
});

router.put('/lessons/:id/quiz', async (req, res, next) => {
  try {
    if (!(await Lesson.exists({ _id: req.params.id }))) return res.status(404).json({ message: 'الدرس غير موجود' });
    const { error, value } = validateQuiz(req.body?.questions);
    if (error) return res.status(400).json({ message: error });
    const quiz = await Quiz.findOneAndUpdate({ lesson: req.params.id }, { questions: value }, { upsert: true, new: true }).lean();
    res.json({ questions: quiz.questions });
  } catch (e) { next(e); }
});

// حذف الكويز بالكامل
router.delete('/lessons/:id/quiz', async (req, res, next) => {
  try {
    await Quiz.deleteOne({ lesson: req.params.id });
    res.json({ questions: [] });
  } catch (e) { next(e); }
});

export default router;
