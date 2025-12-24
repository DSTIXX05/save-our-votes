import express, { Router } from 'express';
import { addBallot, listBallots } from '../controllers/ballotController.js';

const router: Router = express.Router({ mergeParams: true });

router.post('/', addBallot);
router.get('/', listBallots);

export default router;
