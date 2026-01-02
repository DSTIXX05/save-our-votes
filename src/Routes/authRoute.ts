import express, { Router } from 'express';
const router: Router = express.Router();

import {
  signUp,
  verifyEmail,
  resendVerificationEmail,
  login,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

router.post('/signup', signUp);

router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

router.post('/login', login);

router.post('/forgot-password', forgotPassword);

router.patch('/reset-password', resetPassword);

export default router;
