import express from 'express';
import { addBallot, listBallots } from '../controllers/ballotController.js';

const router = express.Router({ mergeParams: true }); // Access :electionId from parent

router.post('/', addBallot); // POST /api/elections/:electionId/ballots
router.get('/', listBallots); // GET /api/elections/:electionId/ballots

export default router;
