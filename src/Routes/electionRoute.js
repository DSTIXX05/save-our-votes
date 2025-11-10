import express from 'express';
import {
  createElection,
  getElection,
  listElections,
  updateElection,
  deleteElection,
  getElectionBySlug,
} from '../controllers/electionController.js';
import ballotRouter from './ballotRoute.js';
import tokenRouter from './tokenRoute.js';

const router = express.Router();

// Nested routes for ballots and tokens under elections
router.use('/:electionId/ballots', ballotRouter);
router.use('/:electionId/tokens', tokenRouter);

// Election routes
router.get('/slug/:slug', getElectionBySlug);
router.post('/', createElection);
router.get('/', listElections);
router.get('/:id', getElection);
router.put('/:id', updateElection);
router.delete('/:id', deleteElection);

export default router;
