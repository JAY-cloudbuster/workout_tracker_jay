import mongoose from 'mongoose';
import config from './index';

const connectDB = async (retries = 5, delay = 5000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(config.mongodb.uri, {
        autoIndex: config.env !== 'production',
      });

      console.log(`✅ MongoDB connected: ${conn.connection.host}`);

      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected. Attempting reconnection...');
      });

      return; // Success, exit function
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, (error as Error).message);
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('❌ All MongoDB connection attempts failed. Server will start without DB.');
      }
    }
  }
};

export default connectDB;

