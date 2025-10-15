import express from 'express';
const router = express.Router();

import {
  signUp,
  verifyEmail,
  resendVerificationEmail,
  login,
} from './../controllers/authController.js';

// User registration
router.post('/signUp', signUp);

// Email verification
router.get('/verify-email', verifyEmail);

// Resend verification email
router.post('/resend-verification', resendVerificationEmail);

// User login
router.post('/login', login);
export default router;
