// تشغيل محلي فقط (npm run dev). على Vercel تُستعمل الدالة في api/index.js بدل هذا الملف.
import app from './app.js';
import { connectDB } from './db.js';

if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is not set (انسخ .env.example إلى .env)'); process.exit(1); }
if (process.env.JWT_SECRET.length < 32) console.warn('تحذير: JWT_SECRET قصير، استخدم 32 حرفاً عشوائياً على الأقل');

const port = process.env.PORT || 5000;
connectDB(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`API on http://localhost:${port}`)))
  .catch((err) => { console.error(err.message); process.exit(1); });
