// بوّابة جودة المحتوى (لا تحتاج قاعدة بيانات):  npm run check:content
// - كل درس يجب أن يحمل مرجعه في الكتاب (source: ...)
// - كل سؤال كويز يجب أن يحمل رقم الصفحة، وأن تكون إجابته الصحيحة صالحة وخياراته غير مكررة
// - لا كويز بدون درس، ولا درس غير موجود في هيكل المنهج (data.js)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { stages } from './data.js';
import { parseLessonFile } from './parseLessonFile.js';
import { validateQuiz } from '../src/lib/validate.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'content');
const problems = [];
let lessons = 0, questions = 0;

for (const stageSlug of fs.readdirSync(root)) {
  const dir = path.join(root, stageSlug);
  if (!fs.statSync(dir).isDirectory()) continue;
  const stage = stages.find((s) => s.slug === stageSlug);
  if (!stage) { problems.push(`${stageSlug}: مرحلة غير موجودة في data.js`); continue; }
  const valid = new Set(stage.units.flatMap((u) => u.lessons.map((_, i) => `lesson-${u.number}-${i + 1}`)));
  const files = fs.readdirSync(dir);

  for (const f of files.filter((x) => x.endsWith('.md'))) {
    const slug = f.replace(/\.md$/, '');
    const where = `${stageSlug}/${slug}`;
    if (!valid.has(slug)) problems.push(`${where}: الدرس غير موجود في هيكل المنهج`);
    const { source, content } = parseLessonFile(fs.readFileSync(path.join(dir, f), 'utf-8'));
    if (!/\d/.test(source)) problems.push(`${where}: ينقصه مرجع الكتاب (source: ... ص ..)`);
    if (content.length < 200) problems.push(`${where}: المحتوى قصير جداً`);
    lessons++;
  }

  for (const f of files.filter((x) => x.endsWith('.quiz.json'))) {
    const slug = f.replace(/\.quiz\.json$/, '');
    const where = `${stageSlug}/${slug}`;
    if (!files.includes(`${slug}.md`)) problems.push(`${where}: كويز بدون ملف درس`);
    let raw;
    try { raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')); } catch (e) { problems.push(`${where}: JSON غير صالح`); continue; }
    const { error, value } = validateQuiz(raw.questions);
    if (error) { problems.push(`${where}: ${error}`); continue; }
    value.forEach((q, i) => {
      questions++;
      if (!/\d/.test(q.source)) problems.push(`${where} سؤال ${i + 1}: ينقصه رقم الصفحة (source)`);
      if (new Set(q.options).size !== q.options.length) problems.push(`${where} سؤال ${i + 1}: خيارات مكررة`);
      if (!q.explanation) problems.push(`${where} سؤال ${i + 1}: ينقصه شرح الإجابة`);
    });
  }
}

console.log(`فُحص: ${lessons} درساً، ${questions} سؤالاً`);
if (problems.length) { console.error(`✗ ${problems.length} مشكلة:\n- ` + problems.join('\n- ')); process.exit(1); }
console.log('✓ كل الدروس لها مراجع، وكل الأسئلة لها أرقام صفحات');
