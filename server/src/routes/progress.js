import { Router } from 'express';
import mongoose from 'mongoose';
import { authRequired } from '../middleware/auth.js';
import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';
import QuizAttempt from '../models/QuizAttempt.js';

const router = Router();
router.use(authRequired);

const LESSON_FIELDS = 'title number slug stageSlug';

// تقدّم الطالب: الدروس المكتملة وأفضل نتيجة لكل كويز
router.get('/', async (req, res, next) => {
  try {
    const [done, best] = await Promise.all([
      Progress.find({ user: req.user._id }).sort({ createdAt: -1 }).lean(),
      QuizAttempt.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: '$lesson', percent: { $max: '$percent' }, attempts: { $sum: 1 } } },
      ]),
    ]);

    const ids = [...new Set([...done.map((d) => String(d.lesson)), ...best.map((b) => String(b._id))])];
    const lessons = await Lesson.find({ _id: { $in: ids } }).select(LESSON_FIELDS).lean();
    const byId = new Map(lessons.map((l) => [String(l._id), l]));

    res.json({
      completed: done
        .filter((d) => byId.has(String(d.lesson)))
        .map((d) => ({ lessonId: String(d.lesson), completedAt: d.createdAt, ...pick(byId.get(String(d.lesson))) })),
      quizBest: best
        .filter((b) => byId.has(String(b._id)))
        .map((b) => ({ lessonId: String(b._id), percent: b.percent, attempts: b.attempts, ...pick(byId.get(String(b._id))) })),
    });
  } catch (e) { next(e); }
});

const pick = (l) => ({ title: l.title, number: l.number, slug: l.slug, stageSlug: l.stageSlug });

async function publishedLesson(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  const lesson = await Lesson.findById(id).select('stage status').lean();
  return lesson && lesson.status === 'published' ? lesson : null;
}

router.post('/lessons/:lessonId', async (req, res, next) => {
  try {
    const lesson = await publishedLesson(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'الدرس غير موجود' });
    await Progress.updateOne(
      { user: req.user._id, lesson: lesson._id },
      { $setOnInsert: { stage: lesson.stage } },
      { upsert: true }
    );
    res.json({ completed: true });
  } catch (e) { next(e); }
});

router.delete('/lessons/:lessonId', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.lessonId)) return res.status(404).json({ message: 'الدرس غير موجود' });
    await Progress.deleteOne({ user: req.user._id, lesson: req.params.lessonId });
    res.json({ completed: false });
  } catch (e) { next(e); }
});

export default router;
