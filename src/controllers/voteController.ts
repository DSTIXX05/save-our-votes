import { Request, Response, NextFunction } from 'express';
import AppError from '../Util/AppError.js';
import catchAsync from '../Util/catchAsync.js';
import { validateToken, castVote } from '../services/voteService.js';
import { TallyRegistry } from '../domain/voting/tally.js';
import Election, { IElection } from '../model/electionModel.js';

// Factory: validate voter token
const validateVoterTokenFactory = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { token, electionId } = req.body || {};
    if (!token || !electionId)
      return next(new AppError('token and electionId required', 400));

    const result = await validateToken({ token, electionId });
    if (!result.ok)
      return res.status(401).json({ status: 'fail', reason: result.reason });

    res.json({ status: 'success' });
  });

// Factory: cast vote
const castFactory = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { token, electionId, ballotId, optionIds } = req.body || {};
    if (!token || !electionId || !ballotId || !optionIds) {
      return next(
        new AppError('token, electionId, ballotId, optionIds required', 400)
      );
    }

    const meta = { ip: req.ip, userAgent: req.headers['user-agent'] as string };
    await castVote({ token, electionId, ballotId, optionIds, meta });

    res.json({ status: 'success', message: 'Vote recorded' });
  });

// Factory: get results for ballot
const resultsForBallotFactory = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { electionId, ballotId } = req.params;

    const election = await Election.findById(electionId).lean();
    if (!election) return next(new AppError('Election not found', 404));

    const ballot = election.ballots.find((b) => String(b._id) === ballotId);
    if (!ballot) return next(new AppError('Ballot not found', 404));

    const strategy = TallyRegistry[ballot.type];
    const tallies = await strategy(electionId, ballotId);

    res.json({ status: 'success', data: { ballotId, tallies } });
  });

export const validateVoterToken = validateVoterTokenFactory();
export const cast = castFactory();
export const resultsForBallot = resultsForBallotFactory();
