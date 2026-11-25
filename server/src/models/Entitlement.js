import mongoose from 'mongoose';

// صلاحية فتح منتج مدفوع لطالب. تُفحص من القاعدة في كل طلب (ليست داخل التوكن) كي يمكن سحبها.
const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: String, required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    expiresAt: { type: Date, default: null },   // null = دائمة
  },
  { timestamps: true }
);
schema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model('Entitlement', schema);
