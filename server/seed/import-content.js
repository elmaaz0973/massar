// استيراد الدروس والكويزات من seed/content/<stage-slug>/
//   <lesson-slug>.md         ← الشرح
//   <lesson-slug>.quiz.json  ← الكويز: { "questions": [{ prompt, options[], correctIndex, explanation }] }
// الاستخدام:
//   npm run import:content            -> يستورد فقط ما ليس له محتوى (لا يكتب فوق تعديلاتك)
//   npm run import:content -- --force -> يكتب فوق الموجود
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Stage from '../src/models/Stage.js';
import Lesson from '../src/models/Lesson.js';
import Quiz from '../src/models/Quiz.js';
import { parseLessonFile } from './parseLessonFile.js';
import { validateQuiz } from '../src/lib/validate.js';

const force = process.argv.includes('--force');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'content');
const stats = { lessons: 0, quizzes: 0, skipped: 0, problems: 0 };

async function importLesson(stage, dir, file) {
  const slug = file.replace(/\.md$/, '');
  const lesson = await Lesson.findOne({ stage: stage._id, slug });
  if (!lesson) { console.warn(`! درس غير موجود: ${stage.slug}/${slug}`); stats.problems++; return; }
  if (lesson.content.trim() && !force) { console.log(`- تخطّي (له محتوى): ${stage.slug}/${slug}`); stats.skipped++; return; }

  const { objectives, source, content } = parseLessonFile(fs.readFileSync(path.join(dir, file), 'utf-8'));
  Object.assign(lesson, { objectives, source, content, status: 'published' });
  await lesson.save();
  console.log(`✓ درس ${stage.slug}/${slug}`);
  stats.lessons++;
}

async function importQuiz(stage, dir, file) {
  const slug = file.replace(/\.quiz\.json$/, '');
  const lesson = await Lesson.findOne({ stage: stage._id, slug });
  if (!lesson) { console.warn(`! درس غير موجود للكويز: ${stage.slug}/${slug}`); stats.problems++; return; }
  if (!force && (await Quiz.exists({ lesson: lesson._id }))) { console.log(`- تخطّي (له كويز): ${stage.slug}/${slug}`); stats.skipped++; return; }

  const { error, value } = validateQuiz(JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')).questions);
  if (error) { console.warn(`! كويز غير صالح ${stage.slug}/${slug}: ${error}`); stats.problems++; return; }
  await Quiz.findOneAndUpdate({ lesson: lesson._id }, { questions: value }, { upsert: true });
  console.log(`✓ كويز ${stage.slug}/${slug} (${value.length} أسئلة)`);
  stats.quizzes++;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const stageSlug of fs.readdirSync(root)) {
    const dir = path.join(root, stageSlug);
    if (!fs.statSync(dir).isDirectory()) continue;
    const stage = await Stage.findOne({ slug: stageSlug });
    if (!stage) { console.warn(`! مرحلة غير موجودة: ${stageSlug} (شغّل npm run seed أولاً)`); continue; }

    const files = fs.readdirSync(dir);
    for (const f of files.filter((x) => x.endsWith('.md'))) await importLesson(stage, dir, f);
    for (const f of files.filter((x) => x.endsWith('.quiz.json'))) await importQuiz(stage, dir, f);
  }
  console.log(`تم: ${stats.lessons} درس، ${stats.quizzes} كويز، ${stats.skipped} متخطّى، ${stats.problems} مشاكل`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
