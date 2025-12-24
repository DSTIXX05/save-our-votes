import Vote from '../../model/voteModel.js';
import { Types } from 'mongoose';

// Simple plurality/count strategy for single/multiple
export async function tallyByBallot(
  electionId: Types.ObjectId | string,
  ballotId: Types.ObjectId | string
): Promise<Record<string, number>> {
  const rows = await Vote.aggregate<{ _id: Types.ObjectId; count: number }>([
    {
      $match: {
        election: new Types.ObjectId(String(electionId)),
        ballot: new Types.ObjectId(String(ballotId)),
      },
    },
    { $unwind: '$optionIds' },
    {
      $group: {
        _id: '$optionIds',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Convert to { optionId: count }
  const result: Record<string, number> = {};
  for (const r of rows) result[String(r._id)] = r.count;
  return result;
}

// Strategy registry (can add ranked/score later)
export const TallyRegistry: Record<string, typeof tallyByBallot> = {
  single: tallyByBallot,
  multiple: tallyByBallot,
};
