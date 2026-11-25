import mongoose from 'mongoose';

// محاولة حلّ وحدة من البنك (الأسئلة الموضوعية فقط؛ تُحسب على الخادم)
const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    unit: { type: Number, required: true },
    lesson: { type: String, default: '' },      // '' = الوحدة كاملة، وإلا slug الدرس (حلّ جزء من الوحدة)
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    percent: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('BankAttempt', schema);
