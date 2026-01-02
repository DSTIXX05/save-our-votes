import mongoose, { Document, Schema, Types } from 'mongoose';
import { IOption, IBallot } from '../Interfaces/electionInterface';

const optionSchema = new Schema<IOption>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    text: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const ballotSchema = new Schema<IBallot>(
  {
    election: {
      type: Schema.Types.ObjectId,
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
    maxSelections: { type: Number, default: 1 },
    options: {
      type: [optionSchema],
      validate: (v: IOption[]) => Array.isArray(v) && v.length > 1,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBallot>('Ballot', ballotSchema);
