import express from 'express';
import { generateTokens } from '../controllers/tokenController.js';

const router = express.Router({ mergeParams: true }); // Access :electionId from parent

router.post('/', generateTokens); // POST /api/elections/:electionId/tokens

export default router;
