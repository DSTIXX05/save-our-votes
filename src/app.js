import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json());

if (process.env.ENV === 'development') {
  app.use(morgan('dev'));
}

import authRoutes from './Routes/authRoute.js';

app.use('/api/auth/', authRoutes);
app.use('/api/', (req, res) => {
  res.send('Server started!');
});

export default app;
