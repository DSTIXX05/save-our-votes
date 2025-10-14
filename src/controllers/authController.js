import User from './../model/userModel.js';
import jwt from 'jsonwebtoken';
import Email from '../Util/Email.js';
import { URL } from 'url';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const signUp = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // basic validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'fullName, email and password are required',
      });
    }

    const newUser = new User({
      fullName,
      email: email.toLowerCase().trim(),
      password,
      role,
    });
    await newUser.save();

    // generate verification token
    const verificationToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // build verification URL safely
    const base =
      (process.env.BACKEND_URL || process.env.FRONTEND_URL || '').replace(
        /\/+$/,
        ''
      ) || `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
    const verificationUrl = new URL('/api/auth/verify-email', base);
    verificationUrl.searchParams.set('token', verificationToken);

    // send verification email but don't fail user creation if email fails
    try {
      await new Email(newUser, verificationUrl.toString()).sendWelcome();
    } catch (emailErr) {
      console.error('Verification email failed (non-fatal):', emailErr);
    }

    res.status(201).json({
      status: 'success',
      message:
        'User created successfully. Check your email to verify your account.',
      data: {
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          isVerified: newUser.isVerified,
        },
      },
    });
  } catch (err) {
    console.error('SignUp error (full):', err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already exists. Please use a different email.',
      });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ status: 'fail', message: err.message });
    }
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again.',
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        status: 'fail',
        message: 'Verification token is required',
      });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user and update verification status
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { isVerified: true },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid token or user not found',
      });
    }

    // Generate auth token for automatic login after verification
    const authToken = signToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully! You are now logged in.',
      token: authToken,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        status: 'fail',
        message:
          'Verification token has expired. Please request a new verification email.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid verification token.',
      });
    }

    console.error('Email verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong during verification. Please try again.',
    });
  }
};

// Resend verification email function
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email address is required',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that email address',
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is already verified',
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Send verification email
    await new Email(user, verificationUrl).sendWelcome();

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully. Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send verification email. Please try again.',
    });
  }
};

export { signUp, verifyEmail, resendVerificationEmail };
