// بوّابة جودة بنك الأسئلة (لا تحتاج قاعدة بيانات):  npm run check:bank
// - كل سؤال تابع لدرس موجود في وحدات الترم الأول (1–7) وفي نفس وحدة الملف
// - رقم الصفحة في source يقع داخل نطاق صفحات الدرس في الكتاب (لضمان عدم الخروج عن المنهج)
// - MCQ: 4 خيارات غير مكررة وcorrectIndex صالح | صح/خطأ: خياران ثابتان | مقالي: إجابة نموذجية ودرجة
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { flattenLessons } from './data.js';

const TERM1_UNITS = new Set([1, 2, 3, 4, 5, 6, 7]);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'bank', 'grade-1', 'term-1');
const lessons = new Map(flattenLessons().filter((r) => r.stage === 'grade-1').map((r) => [r.slug, r]));
const problems = [], ids = new Set();
const stats = { mcq: 0, tf: 0, essay: 0, marks: 0 };

for (const f of fs.existsSync(root) ? fs.readdirSync(root).filter((x) => x.endsWith('.bank.json')) : []) {
  let bank;
  try { bank = JSON.parse(fs.readFileSync(path.join(root, f), 'utf-8')); } catch { problems.push(`${f}: JSON غير صالح`); continue; }
  if (!TERM1_UNITS.has(bank.unit)) problems.push(`${f}: الوحدة ${bank.unit} ليست من الترم الأول`);
  bank.questions.forEach((q, i) => {
    const w = `${f} سؤال ${i + 1} (${q.id})`;
    if (!q.id || ids.has(q.id)) problems.push(`${w}: id مفقود أو مكرر`); ids.add(q.id);
    const L = lessons.get(q.lesson);
    if (!L) { problems.push(`${w}: الدرس ${q.lesson} غير موجود`); return; }
    if (L.unit !== bank.unit) problems.push(`${w}: الدرس ${q.lesson} ليس من الوحدة ${bank.unit}`);
    const page = Number((String(q.source).match(/\d+/) || [])[0]);
    if (!page) problems.push(`${w}: ينقصه رقم الصفحة`);
    else if (page < L.startPage || page > L.endPage) problems.push(`${w}: ص ${page} خارج نطاق الدرس (${L.startPage}–${L.endPage})`);
    if (!q.prompt?.trim()) problems.push(`${w}: نص السؤال فارغ`);
    if (q.type === 'mcq' || q.type === 'tf') {
      stats[q.type]++;
      const n = q.type === 'tf' ? 2 : 4;
      if (!Array.isArray(q.options) || q.options.length !== n) problems.push(`${w}: يجب أن يكون عدد الخيارات ${n}`);
      else if (new Set(q.options).size !== q.options.length) problems.push(`${w}: خيارات مكررة`);
      if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= (q.options?.length ?? 0)) problems.push(`${w}: correctIndex غير صالح`);
      if (!q.explanation?.trim()) problems.push(`${w}: ينقصه شرح الإجابة`);
      if (q.type === 'tf' && JSON.stringify(q.options) !== JSON.stringify(['صح', 'خطأ'])) problems.push(`${w}: خيارا صح/خطأ يجب أن يكونا ["صح","خطأ"]`);
    } else if (q.type === 'essay') {
      stats.essay++; stats.marks += q.marks || 0;
      if (!q.modelAnswer?.trim()) problems.push(`${w}: ينقصه modelAnswer`);
      if (!Number.isInteger(q.marks) || q.marks < 1) problems.push(`${w}: marks غير صالح`);
    } else problems.push(`${w}: نوع سؤال غير معروف (${q.type})`);
  });
}
console.log(`فُحص: ${ids.size} سؤالاً (اختيار ${stats.mcq}، صح/خطأ ${stats.tf}، مقالي ${stats.essay} بمجموع ${stats.marks} درجة)`);
if (problems.length) { console.error(`✗ ${problems.length} مشكلة:\n- ` + problems.join('\n- ')); process.exit(1); }
console.log('✓ كل الأسئلة داخل نطاق دروس الترم الأول وصفحاتها');
