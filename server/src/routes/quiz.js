import { Router } from 'express';
import mongoose from 'mongoose';
import { authOptional } from '../middleware/auth.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Progress from '../models/Progress.js';
import { gradeQuiz, PASS_RATIO } from '../lib/grade.js';

const router = Router({ mergeParams: true });

async function loadQuiz(lessonId) {
  if (!mongoose.isValidObjectId(lessonId)) return null;
  const lesson = await Lesson.findById(lessonId).select('stage status').lean();
  if (!lesson || lesson.status !== 'published') return null;
  const quiz = await Quiz.findOne({ lesson: lesson._id }).lean();
  return quiz ? { lesson, quiz } : null;
}

// الأسئلة بدون الإجابات الصحيحة
router.get('/', async (req, res, next) => {
  try {
    const found = await loadQuiz(req.params.lessonId);
    if (!found) return res.status(404).json({ message: 'لا يوجد كويز لهذا الدرس' });
    res.json({
      passRatio: PASS_RATIO,
      questions: found.quiz.questions.map((q) => ({ prompt: q.prompt, options: q.options })),
    });
  } catch (e) { next(e); }
});

// التصحيح على الخادم. يعمل للزائر، ويُسجَّل للمستخدم المسجّل فقط.
router.post('/submit', authOptional, async (req, res, next) => {
  try {
    const found = await loadQuiz(req.params.lessonId);
    if (!found) return res.status(404).json({ message: 'لا يوجد كويز لهذا الدرس' });

    const { answers } = req.body ?? {};
    if (!Array.isArray(answers) || answers.length !== found.quiz.questions.length) {
      return res.status(400).json({ message: 'الإجابات غير مكتملة' });
    }

    const graded = gradeQuiz(found.quiz.questions, answers);

    if (req.user) {
      await QuizAttempt.create({
        user: req.user._id, lesson: found.lesson._id,
        score: graded.score, total: graded.total, percent: graded.percent, passed: graded.passed,
      });
      if (graded.passed) {
        await Progress.updateOne(
          { user: req.user._id, lesson: found.lesson._id },
          { $setOnInsert: { stage: found.lesson.stage } },
          { upsert: true }
        );
      }
    }
    res.json({ ...graded, saved: Boolean(req.user), passRatio: PASS_RATIO });
  } catch (e) { next(e); }
});

export default router;
