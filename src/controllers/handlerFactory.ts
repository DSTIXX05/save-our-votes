import { Request, Response, NextFunction } from 'express';
import catchAsync from '../Util/catchAsync.js';
import AppError from '../Util/AppError.js';
import { Model, Document } from 'mongoose';

interface PopOptions {
  path: string;
  select?: string;
}

interface HandlerOptions {
  runValidators?: boolean;
}

export const deleteOne = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError("Can't delete. No document found with that ID.", 404)
      );
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const updateOne = (Model: Model<any>, opts: HandlerOptions = {}) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: opts.runValidators ?? true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

export const createOne = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { doc },
    });
  });

export const getOne = (Model: Model<any>, popOptions?: PopOptions) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

export const getAll = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Optional nested filter support
    let filter: Record<string, any> = {};
    if ((req.params as any).parentId)
      filter = { parent: (req.params as any).parentId };

    const docs = await Model.find(filter).lean();

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { docs },
    });
  });
