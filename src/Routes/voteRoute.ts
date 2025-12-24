import express, { Router } from 'express';
import {
  validateVoterToken,
  cast,
  resultsForBallot,
} from '../controllers/voteController.js';

const router: Router = express.Router();

router.post('/validate', validateVoterToken);
router.post('/cast', cast);
router.get('/results/:electionId/:ballotId', resultsForBallot);

export default router;
