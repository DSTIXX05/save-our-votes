import mongoose, { Document, Schema, Types } from 'mongoose';
import { IOption, IBallot, IElection } from '../Interfaces/electionInterface';

const optionSchema = new Schema<IOption>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    text: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const ballotSchema = new Schema<IBallot>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
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
  { _id: true }
);

const electionSchema = new Schema<IElection>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'open', 'closed'],
      default: 'draft',
    },
    ballots: { type: [ballotSchema], default: [] },
  },
  { timestamps: true }
);

// Generate unique slug before validate
electionSchema.pre('validate', async function (next) {
  if (!this.title) return next();
  if (!this.isModified('title') && this.slug) return next();

  const slugify = (text: string): string =>
    String(text)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const base = slugify(this.title) || 'election';
  let slug = base;
  let i = 0;

  while (true) {
    const existing = await mongoose.models.Election.findOne({
      slug,
      _id: { $ne: this._id },
    }).lean();
    if (!existing) break;
    i += 1;
    slug = `${base}-${i}`;
  }

  this.slug = slug;
  next();
});

export default mongoose.model<IElection>('Election', electionSchema);
