import mongoose from 'mongoose';

// درس مكتمل لطالب معيّن
const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    stage: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage', required: true },
  },
  { timestamps: true }
);
progressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
