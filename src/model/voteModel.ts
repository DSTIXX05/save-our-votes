import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVote extends Document {
  election: Types.ObjectId;
  ballot: Types.ObjectId;
  optionIds: Types.ObjectId[];
  meta?: {
    ip?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const voteSchema = new Schema<IVote>(
  {
    election: {
      type: Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
      index: true,
    },
    ballot: {
      type: Schema.Types.ObjectId,
      ref: 'Ballot',
      required: true,
      index: true,
    },
    optionIds: [{ type: Schema.Types.ObjectId, required: true }],
    meta: {
      ip: String,
      userAgent: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IVote>('Vote', voteSchema);
