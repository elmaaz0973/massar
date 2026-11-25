// استيراد بنك الأسئلة من seed/bank/grade-1/term-1/*.bank.json إلى MongoDB
// الاستخدام:  npm run import:bank      (يضيف/يحدّث بالـ id ويحذف الأسئلة التي أُزيلت من الملف)
// شغّل npm run check:bank أولاً. الأسئلة تُخزَّن في القاعدة فقط ولا تُقدَّم كملفات عامة.
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import BankQuestion from '../src/models/BankQuestion.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'bank', 'grade-1', 'term-1');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  let total = 0;
  for (const f of fs.readdirSync(root).filter((x) => x.endsWith('.bank.json')).sort()) {
    const bank = JSON.parse(fs.readFileSync(path.join(root, f), 'utf-8'));
    const ids = [];
    for (const [i, q] of bank.questions.entries()) {
      ids.push(q.id);
      await BankQuestion.findOneAndUpdate(
        { qid: q.id },
        { qid: q.id, grade: bank.grade, term: bank.term, unit: bank.unit, lesson: q.lesson, type: q.type, level: q.level, prompt: q.prompt,
          options: q.options || [], correctIndex: q.correctIndex ?? null, explanation: q.explanation || '',
          marks: q.marks || 0, modelAnswer: q.modelAnswer || '', source: q.source || '', order: i },
        { upsert: true }
      );
    }
    const removed = await BankQuestion.deleteMany({ unit: bank.unit, qid: { $nin: ids } });
    console.log(`✓ الوحدة ${bank.unit}: ${ids.length} سؤالاً (حُذف ${removed.deletedCount})`);
    total += ids.length;
  }
  console.log(`تم: ${total} سؤالاً`);
  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });
