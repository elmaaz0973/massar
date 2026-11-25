import Entitlement from '../models/Entitlement.js';
import { BANK, isFreeUnit, unitNumber } from '../lib/bank.js';
import { authOptional } from './auth.js';

// هل يملك الطالب صلاحية الوحدات المدفوعة؟ تُفحص من قاعدة البيانات في كل طلب.
export async function hasPaidAccess(userId) {
  if (!userId) return false;
  return Boolean(await Entitlement.exists({
    user: userId,
    product: BANK.PRODUCT,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  }));
}

// حارس الوحدة: الوحدة المجانية مفتوحة للجميع، والمدفوعة تتطلب تسجيل دخول + صلاحية.
// لا تصل أي أسئلة أو إجابات لمن لا يملك الصلاحية (الفحص هنا على الخادم، لا في الواجهة).
export const unitAccess = [
  authOptional,
  async (req, res, next) => {
    try {
      const n = unitNumber(req.params.n);
      if (!n) return res.status(404).json({ message: 'الوحدة غير موجودة' });
      req.unit = n;
      if (isFreeUnit(n)) return next();
      if (!req.user) return res.status(401).json({ message: 'سجّل دخولك أولاً لفتح هذه الوحدة', locked: true });
      if (!(await hasPaidAccess(req.user._id))) return res.status(403).json({ message: 'هذه الوحدة للمشتركين فقط', locked: true });
      next();
    } catch (e) { next(e); }
  },
];
