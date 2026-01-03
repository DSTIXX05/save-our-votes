import { Request, Response, NextFunction } from 'express';
import catchAsync from '../Util/catchAsync';
import AppError from '../Util/AppError';
import { importVotersFromCSV } from '../services/voterImportService';

export const uploadVotersCSV = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const { electionId } = req.body;
    if (!electionId) {
      return next(new AppError('electionId required', 400));
    }

    const result = await importVotersFromCSV(req.file.path, electionId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);
