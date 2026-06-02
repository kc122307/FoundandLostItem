import mongoose from 'mongoose';
import { log } from './logger.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    log('info', `MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    log('error', 'MongoDB connection error', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};
