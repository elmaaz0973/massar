// إنشاء حساب إدارة (أو ترقية حساب موجود):
//   npm run create:admin -- you@example.com "اسمك"
// كلمة المرور تُقرأ من ADMIN_PASSWORD إن وُجد، وإلا تُطلب من الطرفية (دون إظهارها).
import 'dotenv/config';
import readline from 'readline';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { validateRegistration } from '../src/lib/validate.js';

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(question)) process.stdout.write(s); };
    rl.question(question, (a) => { rl.close(); process.stdout.write('\n'); resolve(a); });
  });
}

async function run() {
  const [email, name = 'Admin'] = process.argv.slice(2);
  if (!email) { console.error('الاستخدام: npm run create:admin -- email "الاسم"'); process.exit(1); }

  const password = process.env.ADMIN_PASSWORD || (await askHidden('كلمة المرور: '));
  const { error, value } = validateRegistration({ name, email, password });
  if (error) { console.error(error); process.exit(1); }

  await mongoose.connect(process.env.MONGODB_URI);
  const passwordHash = await bcrypt.hash(value.password, 10);
  const existing = await User.findOne({ email: value.email });
  if (existing) {
    existing.role = 'admin';
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`✓ تمت ترقية الحساب الموجود إلى admin: ${value.email}`);
  } else {
    await User.create({ name: value.name, email: value.email, passwordHash, role: 'admin' });
    console.log(`✓ تم إنشاء حساب admin: ${value.email}`);
  }
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
