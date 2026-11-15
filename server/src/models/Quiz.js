import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
    explanation: { type: String, default: '' },
    source: { type: String, default: '' },        // رقم الصفحة في الكتاب
  },
  { _id: false }
);

// كويز واحد لكل درس
const quizSchema = new mongoose.Schema(
  {
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true, unique: true },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
