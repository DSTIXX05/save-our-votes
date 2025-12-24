import express, { Router } from 'express';
import { generateTokens } from '../controllers/tokenController.js';

const router: Router = express.Router({ mergeParams: true });

router.post('/', generateTokens);

export default router;
