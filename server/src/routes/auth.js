import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { authRequired, signToken, publicUser } from '../middleware/auth.js';
import { validateRegistration } from '../lib/validate.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { message: 'محاولات كثيرة، حاول لاحقاً' } });

router.post('/register', limiter, async (req, res, next) => {
  try {
    const { error, value } = validateRegistration(req.body);
    if (error) return res.status(400).json({ message: error });

    if (await User.exists({ email: value.email })) return res.status(409).json({ message: 'هذا البريد مسجّل بالفعل' });

    const passwordHash = await bcrypt.hash(value.password, 10);
    // الدور دائماً student عند التسجيل العام
    const user = await User.create({ name: value.name, email: value.email, passwordHash });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ message: 'هذا البريد مسجّل بالفعل' });
    next(e);
  }
});

router.post('/login', limiter, async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const user = email ? await User.findOne({ email }).select('+passwordHash') : null;
    // رسالة واحدة لا تكشف إن كان البريد موجوداً
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) return res.status(401).json({ message: 'البريد أو كلمة المرور غير صحيحة' });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.get('/me', authRequired, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
