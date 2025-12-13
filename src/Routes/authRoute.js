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

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *             required:
 *               - fullName
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Invalid input
 */
router.post('/signup', signUp);

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify user email
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify-email', verifyEmail);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Verification email resent
 *       404:
 *         description: User not found
 */
router.post('/resend-verification', resendVerificationEmail);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
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
