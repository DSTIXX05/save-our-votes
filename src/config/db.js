import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    await mongoose.connect(MONGODB_URI, {});
    console.log('MongoDB connected');
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
