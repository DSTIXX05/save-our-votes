import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
// import bodyParser from 'body-parser';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.ENV === 'development') {
  app.use(morgan('dev'));
}

import authRoutes from './Routes/authRoute.js';

import electionRouter from './Routes/electionRoute.js';

import voteRouter from './Routes/voteRoute.js';

app.use('/api/auth/', authRoutes);
app.use('/api/elections', electionRouter);
app.use('/api/vote', voteRouter);

// app.use('/api/', (req, res) => {
//   res.send('Server started!');
// });

export default app;
