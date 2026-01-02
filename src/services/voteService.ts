import crypto from 'crypto';
import VoterToken, { IVoterToken } from '../model/voterTokenModel.js';
import Ballot from '../model/ballotModel.js';
import { IBallot } from '../Interfaces/electionInterface.js';
import Vote from '../model/voteModel.js';
import { RuleRegistry } from '../domain/voting/rules.js';
import { Types } from 'mongoose';

interface ValidateTokenParams {
  token: string;
  electionId: string | Types.ObjectId;
}

interface ValidateTokenResult {
  ok: boolean;
  reason?: string;
}

interface CastVoteParams {
  token: string;
  electionId: string | Types.ObjectId;
  ballotId: string | Types.ObjectId;
  optionIds: any[];
  meta?: {
    ip?: string;
    userAgent?: string;
  };
}

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(String(raw)).digest('hex');
}

export async function validateToken({
  token,
  electionId,
}: ValidateTokenParams): Promise<ValidateTokenResult> {
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
}: CastVoteParams): Promise<{ ok: boolean }> {
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
  const ballot = (await Ballot.findById(ballotId).lean()) as any;
  if (!ballot || String(ballot.election) !== String(electionId)) {
    throw new Error('Ballot not found for this election');
  }
  const rule = RuleRegistry[ballot.type];
  if (!rule) throw new Error('Unsupported ballot type');
  const validated = rule.validate(optionIds, ballot as IBallot);

  // Save vote (no token linkage in vote for anonymity)
  await Vote.create({
    election: electionId,
    ballot: ballotId,
    optionIds: validated,
    meta,
  });

  return { ok: true };
}
