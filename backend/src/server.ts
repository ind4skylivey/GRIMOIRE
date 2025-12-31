import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grimoire';

async function start() {
  try {
    if (process.env.NODE_ENV !== 'test') {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    }

    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start server only when not under test harness
if (process.env.NODE_ENV !== 'test') {
  void start();
}

export default app;
