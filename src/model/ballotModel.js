import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    text: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const ballotSchema = new mongoose.Schema(
  {
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ['single', 'multiple'],
      required: true,
      default: 'single',
    },
    maxSelections: { type: Number, default: 1 }, // used for 'multiple'
    options: {
      type: [optionSchema],
      validate: (v) => Array.isArray(v) && v.length > 1,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Ballot', ballotSchema);
