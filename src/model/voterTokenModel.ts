import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVoterToken extends Document {
  election: Types.ObjectId;
  tokenHash: string;
  email?: string;
  used: boolean;
  usedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const voterTokenSchema = new Schema<IVoterToken>(
  {
    election: {
      type: Schema.Types.ObjectId,
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

export default mongoose.model<IVoterToken>('VoterToken', voterTokenSchema);
