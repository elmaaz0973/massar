import mongoose from 'mongoose';

const stageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },      // الصف الأول الثانوي
    subject: { type: String, required: true },    // اسم المادة
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    comingSoon: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Stage', stageSchema);
