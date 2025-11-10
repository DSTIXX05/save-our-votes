import express from 'express';
import {
  validateVoterToken,
  cast,
  resultsForBallot,
} from '../controllers/voteController.js';

const router = express.Router();

router.post('/validate', validateVoterToken); // POST /api/vote/validate
router.post('/cast', cast); // POST /api/vote/cast
router.get('/results/:electionId/:ballotId', resultsForBallot); // GET /api/vote/results/:electionId/:ballotId

export default router;
