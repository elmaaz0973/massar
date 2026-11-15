import 'dotenv/config';
import mongoose from 'mongoose';
import { stages, displayNumber } from './data.js';
import Stage from '../src/models/Stage.js';
import Unit from '../src/models/Unit.js';
import Lesson from '../src/models/Lesson.js';

// يعيد بناء الهيكل فقط. لا يلمس محتوى الدروس (content/objectives/source/status).
// --prune : يحذف الوحدات والدروس التي لم تعد في data.js بشرط ألا يكون لها محتوى.
const prune = process.argv.includes('--prune');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const s of stages) {
    const { units, numberOrder, ...stageData } = s;
    const stage = await Stage.findOneAndUpdate({ slug: s.slug }, stageData, { upsert: true, new: true });

    const keepUnits = new Set();
    const keepLessons = new Set();
    let order = 0;
    let unitOrder = 0;

    for (const u of units) {
      unitOrder += 1;
      const unitSlug = `unit-${u.number}`;
      keepUnits.add(unitSlug);
      const unit = await Unit.findOneAndUpdate(
        { stage: stage._id, slug: unitSlug },
        { stage: stage._id, stageSlug: s.slug, term: u.term, number: u.number, title: u.title, order: unitOrder },
        { upsert: true, new: true }
      );

      let i = 0;
      for (const { title } of u.lessons) {
        i += 1; order += 1;
        const slug = `lesson-${u.number}-${i}`;
        keepLessons.add(slug);
        await Lesson.findOneAndUpdate(
          { stage: stage._id, slug },
          {
            $set: { stage: stage._id, unit: unit._id, stageSlug: s.slug, number: displayNumber(s, u.number, i), title, order },
            $setOnInsert: { objectives: [], content: '', source: '', status: 'draft' },
          },
          { upsert: true }
        );
      }
    }

    if (prune) {
      const staleLessons = await Lesson.deleteMany({ stage: stage._id, slug: { $nin: [...keepLessons] }, content: '' });
      const staleUnits = await Unit.deleteMany({ stage: stage._id, slug: { $nin: [...keepUnits] } });
      console.log(`  (prune) حُذف ${staleLessons.deletedCount} درس و${staleUnits.deletedCount} وحدة قديمة`);
    }
    console.log(`✓ ${s.title}: ${units.length} وحدات، ${order} درساً`);
  }

  // إزالة أي مرحلة لم تعد في data.js (مثل الصف الثالث) إن لم يكن لها دروس بمحتوى
  const slugs = stages.map((s) => s.slug);
  for (const old of await Stage.find({ slug: { $nin: slugs } })) {
    const withContent = await Lesson.countDocuments({ stage: old._id, content: { $ne: '' } });
    if (withContent) { console.log(`! تم تخطي حذف ${old.slug}: يحتوي دروساً بمحتوى`); continue; }
    await Lesson.deleteMany({ stage: old._id });
    await Unit.deleteMany({ stage: old._id });
    await Stage.deleteOne({ _id: old._id });
    console.log(`✓ حُذفت المرحلة المُلغاة: ${old.slug}`);
  }

  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
