import { Request, Response, NextFunction } from 'express';
import Election from '../model/electionModel.js';
import AppError from '../Util/AppError.js';
import catchAsync from '../Util/catchAsync.js';

// Factory: add ballot to election
const addBallotFactory = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { electionId } = req.params;
    const { title, description, type, maxSelections, options } = req.body || {};

    if (!title || !type || !options?.length || options.length < 2) {
      return next(
        new AppError('title, type and at least 2 options required', 400)
      );
    }

    const election = await Election.findById(electionId);
    if (!election) return next(new AppError('Election not found', 404));

    const newBallot = {
      title: title.trim(),
      description: description ? description.trim() : '',
      type,
      maxSelections: type === 'multiple' ? maxSelections || 1 : 1,
      options: options.map((o: any, i: number) => ({
        text: o.text.trim(),
        order: o.order ?? i,
      })),
    };

    election.ballots.push(newBallot as any);
    await election.save();

    res.status(201).json({
      status: 'success',
      data: { ballot: election.ballots[election.ballots.length - 1] },
    });
  });

// Factory: list ballots for election
const listBallotsFactory = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { electionId } = req.params;
    const election = await Election.findById(electionId)
      .select('ballots')
      .lean();
    if (!election) return next(new AppError('Election not found', 404));

    res.json({
      status: 'success',
      results: election.ballots.length,
      data: { ballots: election.ballots },
    });
  });

// Factory: get single ballot
const getBallotFactory = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { electionId, ballotId } = req.params;
    const election = await Election.findById(electionId).lean();
    if (!election) return next(new AppError('Election not found', 404));

    const ballot = election.ballots.find((b) => String(b._id) === ballotId);
    if (!ballot) return next(new AppError('Ballot not found', 404));

    res.json({ status: 'success', data: { ballot } });
  });

// Factory: update ballot
const updateBallotFactory = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { electionId, ballotId } = req.params;
    const { title, description, isActive } = req.body || {};

    const election = await Election.findById(electionId);
    if (!election) return next(new AppError('Election not found', 404));

    const ballot = (election.ballots as any).id(ballotId);
    if (!ballot) return next(new AppError('Ballot not found', 404));

    if (title) ballot.title = title.trim();
    if (description !== undefined) ballot.description = description.trim();
    if (isActive !== undefined) ballot.isActive = isActive;

    await election.save();
    res.json({ status: 'success', data: { ballot } });
  });

// Factory: delete ballot
const deleteBallotFactory = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { electionId, ballotId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return next(new AppError('Election not found', 404));

    (election.ballots as any).id(ballotId)?.remove?.();
    await election.save();

    res.status(204).send();
  });

export const addBallot = addBallotFactory();
export const listBallots = listBallotsFactory();
export const getBallot = getBallotFactory();
export const updateBallot = updateBallotFactory();
export const deleteBallot = deleteBallotFactory();
