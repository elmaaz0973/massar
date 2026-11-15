import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set');
  return s;
}

export const signToken = (user) => jwt.sign({ sub: String(user._id) }, secret(), { expiresIn: '30d' });

async function userFromRequest(req) {
  const m = (req.get('authorization') || '').match(/^Bearer (.+)$/);
  if (!m) return null;
  try {
    const { sub } = jwt.verify(m[1], secret());
    return await User.findById(sub);
  } catch {
    return null;
  }
}

// يضيف req.user إن وُجد توكن صالح، ويكمل بدونه
export async function authOptional(req, _res, next) {
  try { req.user = await userFromRequest(req); next(); } catch (e) { next(e); }
}

export async function authRequired(req, res, next) {
  try {
    req.user = await userFromRequest(req);
    if (!req.user) return res.status(401).json({ message: 'يجب تسجيل الدخول' });
    next();
  } catch (e) { next(e); }
}

export const requireAdmin = [
  authRequired,
  (req, res, next) => (req.user.role === 'admin' ? next() : res.status(403).json({ message: 'هذه الصفحة للإدارة فقط' })),
];

export const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role });
