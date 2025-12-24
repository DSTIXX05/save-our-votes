import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../model/userModel.js';
import jwt, { SignOptions } from 'jsonwebtoken';
import Email from '../Util/Email.js';
import { URL } from 'url';
import AppError from '../Util/AppError.js';

interface JWTPayload {
  id: string;
  iat?: number;
}

const signToken = (id: string): string => {
  const secret = (process.env.JWT_SECRET || 'secret') as string;
  return jwt.sign({ id }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

const createSendToken = (
  user: any,
  statusCode: number,
  res: Response
): void => {
  const token = signToken((user._id as any).toString());

  const cookieOptions = {
    sameSite: 'none' as const,
    maxAge:
      parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '1') * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
  };

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined as any;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, password, role } = req.body;

    // basic validation
    if (!fullName || !email || !password) {
      return next(
        new AppError('fullName, email and password are required', 400)
      );
    }

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      password,
      role,
    });

    // generate verification token
    const verificationToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || 'secret',
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
  } catch (err: any) {
    console.error('SignUp error (full):', err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return next(
        new AppError('Email already exists. Please use a different email.', 400)
      );
    }
    if (err.name === 'ValidationError') {
      return next(new AppError(err.message, 400));
    }
    next(err);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token) {
      return next(new AppError('Verification token is required', 400));
    }

    // Verify the JWT token
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET || 'secret'
    ) as JWTPayload;

    // Find the user and update verification status
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { isVerified: true },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('Invalid token or user not found', 404));
    }

    // Generate auth token for automatic login after verification
    const authToken = signToken((user._id as any).toString());

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
  } catch (error: any) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return next(
        new AppError(
          'Verification token has expired. Please request a new verification email.',
          400
        )
      );
    }

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid verification token.', 400));
    }

    console.error('Email verification error:', error);
    next(error);
  }
};

// Resend verification email function
export const resendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Email address is required', 400));
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.isVerified) {
      return next(new AppError('This account is already verified', 400));
    }

    // generate verification token
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // build verification URL
    const base =
      (process.env.BACKEND_URL || process.env.FRONTEND_URL || '').replace(
        /\/+$/,
        ''
      ) || `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
    const verificationUrl = new URL('/api/auth/verify-email', base);
    verificationUrl.searchParams.set('token', verificationToken);

    try {
      await new Email(user, verificationUrl.toString()).sendWelcome();
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr);
      return next(new AppError('Error sending verification email', 500));
    }

    res.json({
      status: 'success',
      message: 'Verification email sent successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Login function
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    if (!user.isVerified) {
      return next(new AppError('Please verify your email first', 403));
    }

    // If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};
