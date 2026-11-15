import mongoose from 'mongoose';

// وحدة (Unit) أو فصل (Chapter) داخل مرحلة وترم معيّن
const unitSchema = new mongoose.Schema(
  {
    stage: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage', required: true, index: true },
    stageSlug: { type: String, required: true },
    term: { type: Number, enum: [1, 2], required: true },
    number: { type: Number, required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

unitSchema.index({ stage: 1, slug: 1 }, { unique: true });

export default mongoose.model('Unit', unitSchema);
