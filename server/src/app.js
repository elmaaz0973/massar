import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import contentRoutes from './routes/content.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';
import quizRoutes from './routes/quiz.js';
import bankRoutes from './routes/bank.js';

const app = express();
app.set('trust proxy', 1); // خلف Vercel/بروكسي: لازم لـ express-rate-limit ولقراءة IP الحقيقي
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// تحقق من الإعدادات ثم اتصل بقاعدة البيانات (عند أول طلب، ثم يُعاد استعمال الاتصال)
app.use('/api', async (_req, res, next) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    console.error('JWT_SECRET is not set or too short');
    return res.status(500).json({ message: 'إعدادات الخادم ناقصة' });
  }
  try { await connectDB(process.env.MONGODB_URI); next(); } catch (e) {
    console.error(e.message);
    res.status(503).json({ message: 'تعذّر الاتصال بقاعدة البيانات' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/lessons/:lessonId/quiz', quizRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', contentRoutes);

app.use((req, res) => res.status(404).json({ message: 'المسار غير موجود' }));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'حدث خطأ في الخادم' });
});

export default app;
