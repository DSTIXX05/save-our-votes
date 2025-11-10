import Vote from '../../model/voteModel.js';

// Simple plurality/count strategy for single/multiple
export async function tallyPlurality(electionId, ballotId) {
  // Aggregate counts per optionId
  const rows = await Vote.aggregate([
    { $match: { election: ballotId ? undefined : electionId, ballot: ballotId } }
  ]);

  // The above match is insufficient; do a more explicit pipeline:
}

export async function tallyByBallot(electionId, ballotId) {
  const rows = await Vote.aggregate([
    { $match: { election: electionId, ballot: ballotId } },
    { $unwind: '$optionIds' },
    {
      $group: {
        _id: '$optionIds',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Convert to { optionId: count }
  const result = {};
  for (const r of rows) result[String(r._id)] = r.count;
  return result;
}

// Strategy registry (can add ranked/score later)
export const TallyRegistry = {
  single: tallyByBallot,
  multiple: tallyByBallot
};