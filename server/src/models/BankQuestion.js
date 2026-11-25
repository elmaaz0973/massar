import mongoose from 'mongoose';

// سؤال في بنك الأسئلة. الإجابات (correctIndex / explanation / modelAnswer) لا تُرسل أبداً مع قائمة الأسئلة.
const schema = new mongoose.Schema(
  {
    qid: { type: String, required: true, unique: true },       // مثال: u1-l1-m1
    grade: { type: String, default: 'grade-1' },
    term: { type: Number, default: 1 },
    unit: { type: Number, required: true, index: true },
    lesson: { type: String, default: '' },                     // lesson-1-1
    type: { type: String, enum: ['mcq', 'tf', 'essay'], required: true },
    level: { type: String, default: '' },                      // تذكّر / فهم / تطبيق
    prompt: { type: String, required: true },
    options: { type: [String], default: [] },
    correctIndex: { type: Number, default: null },
    explanation: { type: String, default: '' },
    marks: { type: Number, default: 0 },
    modelAnswer: { type: String, default: '' },
    source: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('BankQuestion', schema);
