import mongoose from 'mongoose';

// طلب دفع يدوي (إنستاباي): يُراجعه الأدمن ثم يُنشئ Entitlement
const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: String, required: true },
    amount: { type: Number, required: true },
    reference: { type: String, required: true, unique: true, uppercase: true, trim: true }, // رقم العملية: فريد لمنع إعادة الاستخدام
    payerName: { type: String, required: true, trim: true, maxlength: 60 },
    payerPhone: { type: String, default: '', trim: true, maxlength: 20 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    note: { type: String, default: '', maxlength: 200 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', schema);
