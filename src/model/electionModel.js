import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);
// simple slugify helper
function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD') // handle accents
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .trim()
    .replace(/[\s_-]+/g, '-') // collapse spaces/underscores
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}

// generate unique slug before validate/save
electionSchema.pre('validate', async function (next) {
  if (!this.title) return next();

  // only generate if slug empty or title changed
  if (!this.isModified('title') && this.slug) return next();

  const base = slugify(this.title) || 'election';
  let slug = base;
  let i = 0;

  // ensure uniqueness (exclude current doc by _id)
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // findOne using model via mongoose.models to avoid hoisting issues
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

export default mongoose.model('Election', electionSchema);
