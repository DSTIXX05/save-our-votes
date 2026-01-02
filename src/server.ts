import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

// Import models to register schemas
import './model/userModel.js';
import './model/electionModel.js';
import './model/ballotModel.js';
import './model/voteModel.js';
import './model/voterTokenModel.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
