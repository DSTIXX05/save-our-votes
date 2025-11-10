import crypto from 'crypto';
import VoterToken from '../model/voterTokenModel.js';
import Election from '../model/electionModel.js';
import Email from '../Util/Email.js';
import AppError from '../Util/AppError.js';

function hashToken(raw) {
  return crypto.createHash('sha256').update(String(raw)).digest('hex');
}

export const generateTokens = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const { emails = [], expiryHours = 24 } = req.body || {};

    if (!emails.length) return next(new AppError('emails array required', 400));

    const election = await Election.findById(electionId);
    if (!election) return next(new AppError('Election not found', 404));

    const tokens = [];
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    for (const email of emails) {
      const raw = crypto.randomBytes(24).toString('hex');
      const tokenHash = hashToken(raw);
      await VoterToken.create({
        election: electionId,
        tokenHash,
        email: email.trim(),
        expiresAt,
      });
      tokens.push({ email, token: raw });
    }

    // Optionally send emails here (async)
    // for (const t of tokens) {
    //   const voteUrl = `${process.env.FRONTEND_URL}/vote?token=${t.token}&electionId=${electionId}`;
    //   await new Email({ email: t.email }, voteUrl).sendInvite();
    // }

    res
      .status(201)
      .json({ status: 'success', count: tokens.length, data: { tokens } });
  } catch (err) {
    next(err);
  }
};
