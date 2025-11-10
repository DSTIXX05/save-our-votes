import express from 'express';
const router = express.Router();

import {
  signUp,
  verifyEmail,
  resendVerificationEmail,
  login,
} from './../controllers/authController.js';
import Ballot from '../model/ballotModel.js';
import AppError from '../Util/AppError.js';
import Election from '../model/electionModel.js';

// User registration
router.post('/signup', signUp);

// Email verification
router.get('/verify-email', verifyEmail);

// Resend verification email
router.post('/resend-verification', resendVerificationEmail);

// User login
router.post('/login', login);

export const createBallot = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const { title, description, type, maxSelections, options } = req.body || {};

    if (!title || !type || !options || options.length < 2) {
      return next(
        new AppError('title, type and at least 2 options required', 400)
      );
    }

    const election = await Election.findById(electionId);
    if (!election) return next(new AppError('Election not found', 404));

    const ballot = await Ballot.create({
      election: electionId,
      title: title.trim(),
      description: description ? description.trim() : '',
      type,
      maxSelections: type === 'multiple' ? maxSelections || 1 : 1,
      options: options.map((o, i) => ({ text: o.text, order: o.order ?? i })),
    });

    res.status(201).json({ status: 'success', data: { ballot } });
  } catch (err) {
    next(err);
  }
};

export const listBallots = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const ballots = await Ballot.find({ election: electionId }).lean();
    res.json({ status: 'success', results: ballots.length, data: { ballots } });
  } catch (err) {
    next(err);
  }
};

export default router;
