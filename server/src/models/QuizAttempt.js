import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percent: { type: Number, required: true },
    passed: { type: Boolean, required: true },
  },
  { timestamps: true }
);
attemptSchema.index({ user: 1, lesson: 1 });

export default mongoose.model('QuizAttempt', attemptSchema);
