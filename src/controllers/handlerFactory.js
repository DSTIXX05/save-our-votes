import catchAsync from '../Util/catchAsync.js';
import AppError from '../Util/AppError.js';
// import APIFeatures from '../utils/apiFeatures.js'; // enable if present

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
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

export const updateOne = (Model, opts = {}) =>
  catchAsync(async (req, res, next) => {
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

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { doc },
    });
  });

export const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
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

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // Optional nested filter support
    let filter = {};
    if (req.params?.parentId) filter = { parent: req.params.parentId };

    // If you have APIFeatures, enable the lines below, otherwise do a simple find.
    // const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    // const docs = await features.query;

    const docs = await Model.find(filter).lean();

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { docs },
    });
  });
