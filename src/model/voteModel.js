import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema(
  {
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true, index: true },
    ballot: { type: mongoose.Schema.Types.ObjectId, ref: 'Ballot', required: true, index: true },
    optionIds: [{ type: mongoose.Schema.Types.ObjectId, required: true }], // selected options
    meta: {
      ip: String,
      userAgent: String
    }
  },
  { timestamps: true }
);

export default mongoose.model('Vote', voteSchema);