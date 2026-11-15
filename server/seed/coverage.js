// تقرير التغطية: أي الدروس كُتب لها محتوى وكويز (من الكتاب) وأيها لا يزال ينتظر.   npm run coverage
// لا يحتاج قاعدة بيانات. «تم» تعني: ملف درس بمرجع صفحات + كويز بأرقام صفحات، اجتاز check-content.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { flattenLessons } from './data.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'content');
const rows = flattenLessons();
const has = (r, ext) => fs.existsSync(path.join(root, r.stage, `${r.slug}${ext}`));
let done = 0;
const byStage = {};

for (const r of rows) {
  const lesson = has(r, '.md'), quiz = has(r, '.quiz.json');
  r.state = lesson && quiz ? 'تم' : lesson ? 'درس فقط' : '—';
  if (lesson && quiz) done++;
  (byStage[r.stage] ??= []).push(r);
}

for (const [stage, list] of Object.entries(byStage)) {
  console.log(`\n== ${stage}: ${list.filter((r) => r.state === 'تم').length}/${list.length} تم ==`);
  for (const r of list) {
    console.log(`${r.state.padEnd(8)} ${r.number.padEnd(6)} ص ${String(r.startPage).padStart(3)}–${String(r.endPage).padEnd(3)} ${r.title}`);
  }
}
console.log(`\nالإجمالي: ${done}/${rows.length} درساً مكتملاً (شرح + كويز)`);
