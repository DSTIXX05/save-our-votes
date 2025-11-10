import mongoose from 'mongoose';

const voterTokenSchema = new mongoose.Schema(
  {
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, index: true },
    email: { type: String },
    used: { type: Boolean, default: false, index: true },
    usedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('VoterToken', voterTokenSchema);
