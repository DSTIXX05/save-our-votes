import crypto from 'crypto';
import VoterToken from '../model/voterTokenModel.js';
import Ballot from '../model/ballotModel.js';
import Vote from '../model/voteModel.js';
import { RuleRegistry } from '../domain/voting/rules.js';

function hashToken(raw) {
  return crypto.createHash('sha256').update(String(raw)).digest('hex');
}

export async function validateToken({ token, electionId }) {
  const tokenHash = hashToken(token);
  const vt = await VoterToken.findOne({ election: electionId, tokenHash });
  if (!vt) return { ok: false, reason: 'invalid' };
  if (vt.used) return { ok: false, reason: 'used' };
  if (vt.expiresAt && vt.expiresAt < new Date())
    return { ok: false, reason: 'expired' };
  return { ok: true };
}

// Atomically consume token and record vote
export async function castVote({
  token,
  electionId,
  ballotId,
  optionIds,
  meta,
}) {
  const tokenHash = hashToken(token);

  // Atomically mark token used to prevent double-vote
  const consumed = await VoterToken.findOneAndUpdate(
    { election: electionId, tokenHash, used: false },
    { $set: { used: true, usedAt: new Date() } },
    { new: true }
  );
  if (!consumed) {
    throw new Error('Invalid or already used token');
  }

  // Load ballot and validate selection via rule
  const ballot = await Ballot.findById(ballotId).lean();
  if (!ballot || String(ballot.election) !== String(electionId)) {
    throw new Error('Ballot not found for this election');
  }
  const rule = RuleRegistry[ballot.type];
  if (!rule) throw new Error('Unsupported ballot type');
  const validated = rule.validate(optionIds, ballot);

  // Save vote (no token linkage in vote for anonymity)
  await Vote.create({
    election: electionId,
    ballot: ballotId,
    optionIds: validated,
    meta,
  });

  return { ok: true };
}
