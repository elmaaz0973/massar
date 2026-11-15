import { Router } from 'express';
import Stage from '../models/Stage.js';
import Unit from '../models/Unit.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';

const router = Router();

// المنصة تضم الصف الأول والثاني فقط (أُزيل الصف الثالث)
const ACTIVE_STAGES = ['grade-1', 'grade-2'];

// قائمة المراحل مع عدد الدروس
router.get('/stages', async (_req, res, next) => {
  try {
    const stages = await Stage.find({ slug: { $in: ACTIVE_STAGES } }).sort({ order: 1 }).lean();
    const counts = await Lesson.aggregate([
      { $group: { _id: '$stage', total: { $sum: 1 }, published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } } } },
    ]);
    const byStage = new Map(counts.map((c) => [String(c._id), c]));
    res.json(
      stages.map((s) => ({
        ...s,
        lessonsCount: byStage.get(String(s._id))?.total ?? 0,
        publishedCount: byStage.get(String(s._id))?.published ?? 0,
      }))
    );
  } catch (e) { next(e); }
});

// مرحلة واحدة بوحداتها ودروسها (بدون المحتوى الكامل)
router.get('/stages/:slug', async (req, res, next) => {
  try {
    const stage = ACTIVE_STAGES.includes(req.params.slug) ? await Stage.findOne({ slug: req.params.slug }).lean() : null;
    if (!stage) return res.status(404).json({ message: 'المرحلة غير موجودة' });

    const [units, lessons] = await Promise.all([
      Unit.find({ stage: stage._id }).sort({ term: 1, order: 1 }).lean(),
      Lesson.find({ stage: stage._id }).sort({ order: 1 }).select('-content').lean(),
    ]);

    const lessonsByUnit = new Map();
    for (const l of lessons) {
      const key = String(l.unit);
      if (!lessonsByUnit.has(key)) lessonsByUnit.set(key, []);
      lessonsByUnit.get(key).push(l);
    }

    res.json({
      stage,
      units: units.map((u) => ({ ...u, lessons: lessonsByUnit.get(String(u._id)) ?? [] })),
    });
  } catch (e) { next(e); }
});

// درس واحد مع الدرس السابق والتالي
router.get('/stages/:stageSlug/lessons/:lessonSlug', async (req, res, next) => {
  try {
    const stage = await Stage.findOne({ slug: req.params.stageSlug }).lean();
    if (!stage) return res.status(404).json({ message: 'المرحلة غير موجودة' });

    const lesson = await Lesson.findOne({ stage: stage._id, slug: req.params.lessonSlug }).lean();
    if (!lesson) return res.status(404).json({ message: 'الدرس غير موجود' });

    const [unit, prev, next_] = await Promise.all([
      Unit.findById(lesson.unit).lean(),
      Lesson.findOne({ stage: stage._id, order: { $lt: lesson.order } }).sort({ order: -1 }).select('title slug number').lean(),
      Lesson.findOne({ stage: stage._id, order: { $gt: lesson.order } }).sort({ order: 1 }).select('title slug number').lean(),
    ]);

    // لا نُرسل محتوى المسودات للعامة
    if (lesson.status !== 'published') lesson.content = '';

    const hasQuiz = lesson.status === 'published' && Boolean(await Quiz.exists({ lesson: lesson._id }));

    res.json({ stage, unit, lesson, prev, next: next_, hasQuiz });
  } catch (e) { next(e); }
});

export default router;
