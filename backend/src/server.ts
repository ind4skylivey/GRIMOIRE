import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';
import { pruneExpiredTokens } from './services/tokenService';

const PORT = env.PORT || 5000;
const MONGODB_URI = env.MONGODB_URI || 'mongodb://localhost:27017/grimoire';

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // prune expired refresh tokens on boot
    await pruneExpiredTokens();

    // schedule periodic cleanup (hourly) in non-test env
    if (env.NODE_ENV !== 'test') {
      setInterval(() => {
        void pruneExpiredTokens().catch((err) => console.error('Failed to prune tokens', err));
      }, 60 * 60 * 1000);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start server only when not under test harness
if (env.NODE_ENV !== 'test') {
  void start();
}

export default app;
