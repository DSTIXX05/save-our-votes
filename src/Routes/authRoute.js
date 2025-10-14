import express from 'express';
const router = express.Router();

import {
  signUp,
  verifyEmail,
  resendVerificationEmail,
} from './../controllers/authController.js';

// User registration
router.post('/signUp', signUp);

// Email verification
router.get('/verify-email', verifyEmail);

// Resend verification email
router.post('/resend-verification', resendVerificationEmail);

export default router;
