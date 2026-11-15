import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    stage: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage', required: true, index: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    stageSlug: { type: String, required: true },
    number: { type: String, required: true },     // مثل "1-1"
    slug: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },          // ترتيب الدرس داخل المرحلة كلها
    objectives: { type: [String], default: [] },  // أهداف التعلم (تُكتب بصياغتنا)
    content: { type: String, default: '' },       // Markdown (المرحلة 2)
    source: { type: String, default: '', maxlength: 300 }, // المرجع في الكتاب (الدرس والصفحات)
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  { timestamps: true }
);

lessonSchema.index({ stage: 1, slug: 1 }, { unique: true });

export default mongoose.model('Lesson', lessonSchema);
