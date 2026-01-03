import express, { Express, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import AppError from './Util/AppError.js';
import authRoutes from './Routes/authRoute.js';
import electionRouter from './Routes/electionRoute.js';
import voteRouter from './Routes/voteRoute.js';
import voterRouter from './Routes/voterRoute';

dotenv.config();

const app: Express = express();

// Trust proxy for Heroku
app.set('trust proxy', 1);

// Logging based on environment - MUST be before other middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Swagger UI - only in development
if (process.env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use('/api/auth/', authRoutes);
app.use('/api/elections', electionRouter);
app.use('/api/vote', voteRouter);
app.use('/api/voters', voterRouter);

// Global error handling middleware
app.use(
  (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    console.error('Unexpected error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
);

export default app;
