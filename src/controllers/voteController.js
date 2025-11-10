import AppError from '../Util/AppError.js';
import { validateToken, castVote } from '../services/voteService.js';
import { TallyRegistry } from '../domain/voting/tally.js';
import Ballot from '../model/ballotModel.js';

export const validateVoterToken = async (req, res, next) => {
  try {
    const { token, electionId } = req.body || {};
    if (!token || !electionId)
      return next(new AppError('token and electionId are required', 400));
    const result = await validateToken({ token, electionId });
    if (!result.ok)
      return res.status(401).json({ status: 'fail', reason: result.reason });
    res.json({ status: 'success' });
  } catch (e) {
    next(e);
  }
};

export const cast = async (req, res, next) => {
  try {
    const { token, electionId, ballotId, optionIds } = req.body || {};
    if (!token || !electionId || !ballotId || !optionIds) {
      return next(
        new AppError('token, electionId, ballotId, optionIds required', 400)
      );
    }
    const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
    await castVote({ token, electionId, ballotId, optionIds, meta });
    res.json({ status: 'success', message: 'Vote recorded' });
  } catch (e) {
    if (e.message.includes('token'))
      return res.status(401).json({ status: 'fail', message: e.message });
    next(e);
  }
};

export const resultsForBallot = async (req, res, next) => {
  try {
    const { electionId, ballotId } = req.params;
    const ballot = await Ballot.findById(ballotId).lean();
    if (!ballot || String(ballot.election) !== String(electionId)) {
      return next(new AppError('Ballot not found for election', 404));
    }
    const strategy = TallyRegistry[ballot.type];
    const tallies = await strategy(electionId, ballotId);
    res.json({ status: 'success', data: { ballotId, tallies } });
  } catch (e) {
    next(e);
  }
};
